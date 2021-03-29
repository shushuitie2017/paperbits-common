﻿import * as Utils from "../utils";
import * as Constants from "../constants";
import { PopupContract } from "../popups/popupContract";
import { IPopupService } from "../popups/IPopupService";
import { IObjectStorage, Query, Page } from "../persistence";
import { Contract } from "../contract";
import { ILocaleService } from "../localization";
import { PopupMetadata } from "./popupMetadata";
import { PopupLocalizedContract } from "./popupLocalizedContract";

const popupsPath = "popups";
const documentsPath = "files";

export class PopupService implements IPopupService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly localeService: ILocaleService
    ) { }

    public async getPopupByKey(key: string, requestedLocale?: string): Promise<PopupContract> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        const popupContract = await this.objectStorage.getObject<PopupLocalizedContract>(key);

        if (!popupContract) {
            return null;
        }

        const defaultLocale = await this.localeService.getDefaultLocale();
        const currentLocale = await this.localeService.getCurrentLocale();

        return this.localizedContractToContract(defaultLocale, currentLocale, requestedLocale, popupContract);
    }

    /**
     * Copies limited number of metadata properties.
     */
    private copyMetadata(sourceMetadata: PopupMetadata, targetMetadata: PopupMetadata): PopupMetadata {
        if (!sourceMetadata) {
            throw new Error(`Parameter "sourceMetadata" not specified.`);
        }

        if (!targetMetadata) {
            throw new Error(`Parameter "targetMetadata" not specified.`);
        }

        targetMetadata.title = sourceMetadata.title;
        targetMetadata.description = sourceMetadata.description;

        return targetMetadata;
    }

    private localizedContractToContract(defaultLocale: string, currentLocale: string, requestedLocale: string, localizedPopupContract: PopupLocalizedContract): PopupContract {
        const locales = localizedPopupContract[Constants.localePrefix];

        const popupMetadata = (requestedLocale
            ? locales[requestedLocale]
            : locales[currentLocale])
            || this.copyMetadata(locales[defaultLocale], {});

        if (!popupMetadata) {
            return null;
        }

        const popupContract: any = {
            key: localizedPopupContract.key,
            ...popupMetadata
        };

        return popupContract;
    }

    private convertPopup(localizedPopup: Page<PopupLocalizedContract>, defaultLocale: string, searchLocale: string, requestedLocale: string): Page<PopupContract> {
        const resultPopup: Page<PopupContract> = {
            value: localizedPopup.value.map(x => this.localizedContractToContract(defaultLocale, searchLocale, requestedLocale, x)),
            takeNext: async (): Promise<Page<PopupContract>> => {
                const nextLocalizedPopup = await localizedPopup.takeNext();
                return this.convertPopup(nextLocalizedPopup, defaultLocale, searchLocale, requestedLocale);
            }
        };

        if (!localizedPopup.takeNext) {
            resultPopup.takeNext = null;
        }

        return resultPopup;
    }

    public async search(query: Query<PopupContract>, requestedLocale?: string): Promise<Page<PopupContract>> {
        if (!query) {
            throw new Error(`Parameter "query" not specified.`);
        }

        const defaultLocale = await this.localeService.getDefaultLocale();
        const currentLocale = await this.localeService.getCurrentLocale();
        const searchLocale = requestedLocale || currentLocale;

        const localizedQuery = Utils.localizeQuery(query, searchLocale);

        try {
            const popupOfResults = await this.objectStorage.searchObjects<PopupLocalizedContract>(popupsPath, localizedQuery);
            return this.convertPopup(popupOfResults, defaultLocale, searchLocale, requestedLocale);

        }
        catch (error) {
            throw new Error(`Unable to search popups: ${error.stack || error.message}`);
        }
    }

    public async deletePopup(popup: PopupContract): Promise<void> {
        const deletePopupPromise = this.objectStorage.deleteObject(popup.key);
        await Promise.all([deletePopupPromise]);
    }

    private getPopupDefaultContent(): any {
        return {
            type: "popup",
            key: "popups/5580ced1-61f9-9bdd-751e-ce5418608a28",
            backdrop: true,
            styles: {
                instance: {
                    components: {
                        popupBackdrop: {
                            default: {
                                position: {
                                    position: "fixed",
                                    top: "0",
                                    left: "0",
                                    right: "0",
                                    bottom: "0",
                                    zIndex: 1000
                                },
                                background: {
                                    colorKey: "colors/a4ZAV"
                                }
                            }
                        },
                        popupContainer: {
                            default: {
                                position: {
                                    position: "fixed",
                                    top: "50%",
                                    left: "50%",
                                    zIndex: 1001
                                },
                                background: {
                                    colorKey: "colors/defaultBg"
                                },
                                transform: {
                                    translate: {
                                        x: "-50%",
                                        y: "-50%"
                                    }
                                },
                                size: {
                                    maxWidth: 500
                                },
                                padding: {
                                    top: 20,
                                    left: 30,
                                    right: 30,
                                    bottom: 30
                                },
                                container: {
                                    overflow: "scroll"
                                },
                                border: {
                                    bottom: {
                                        colorKey: "colors/15o9C",
                                        style: "solid",
                                        width: "1"
                                    },
                                    left: {
                                        colorKey: "colors/15o9C",
                                        style: "solid",
                                        width: "1"
                                    },
                                    right: {
                                        colorKey: "colors/15o9C",
                                        style: "solid",
                                        width: "1"
                                    },
                                    top: {
                                        colorKey: "colors/15o9C",
                                        style: "solid",
                                        width: "1"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            nodes: [
                {
                    type: "text-block",
                    nodes: [
                        {
                            type: "heading1",
                            nodes: [
                                {
                                    type: "text",
                                    text: "Popup"
                                }
                            ]
                        },
                        {
                            type: "paragraph",
                            nodes: [
                                {
                                    type: "text",
                                    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor..."
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    public async createPopup(title: string, description?: string): Promise<PopupContract> {
        const locale = await this.localeService.getDefaultLocale();
        const identifier = Utils.guid();
        const popupKey = `${popupsPath}/${identifier}`;
        const contentKey = `${documentsPath}/${identifier}`;

        const localizedPopup: PopupLocalizedContract = {
            key: popupKey,
            locales: {
                [locale]: {
                    title: title,
                    description: description,
                    contentKey: contentKey
                }
            }
        };

        await this.objectStorage.addObject<PopupLocalizedContract>(popupKey, localizedPopup);

        const template = this.getPopupDefaultContent();
        template["key"] = contentKey; // rewriting own key
        await this.objectStorage.addObject<Contract>(contentKey, template);

        const popupContent: PopupContract = {
            key: popupKey,
            title: title,
            description: description,
            contentKey: contentKey
        };

        return popupContent;
    }

    public async updatePopup(popup: PopupContract): Promise<void> {
        await this.objectStorage.updateObject<PopupContract>(popup.key, popup);
    }

    public async getPopupContent(popupKey: string, requestedLocale?: string): Promise<Contract> {
        if (!popupKey) {
            throw new Error(`Parameter "popupKey" not specified.`);
        }

        if (!requestedLocale) {
            requestedLocale = await this.localeService.getCurrentLocale();
        }

        const defaultLocale = await this.localeService.getDefaultLocale();
        const localizedPopupContract = await this.objectStorage.getObject<PopupLocalizedContract>(popupKey);

        let popupMetadata = localizedPopupContract.locales[requestedLocale];

        if (!popupMetadata) {
            popupMetadata = localizedPopupContract.locales[defaultLocale];
        }

        let popupContent;

        if (popupMetadata.contentKey) {
            popupContent = await this.objectStorage.getObject<Contract>(popupMetadata.contentKey);
        }
        else {
            const popupDefaultLocaleMetadata = localizedPopupContract.locales[defaultLocale];
            popupContent = await this.objectStorage.getObject<Contract>(popupDefaultLocaleMetadata.contentKey);
        }

        return popupContent;
    }

    public async updatePopupContent(popupKey: string, content: Contract, requestedLocale?: string): Promise<void> {
        if (!popupKey) {
            throw new Error(`Parameter "popupKey" not specified.`);
        }

        if (!content) {
            throw new Error(`Parameter "content" not specified.`);
        }

        const localizedPopupContract = await this.objectStorage.getObject<PopupLocalizedContract>(popupKey);

        if (!localizedPopupContract) {
            throw new Error(`Popup with key "${popupKey}" not found.`);
        }

        if (!requestedLocale) {
            requestedLocale = await this.localeService.getCurrentLocale();
        }

        let popupMetadata = localizedPopupContract.locales[requestedLocale];

        if (!popupMetadata) {
            const defaultLocale = await this.localeService.getDefaultLocale();
            const defaultPopupMetadata = localizedPopupContract.locales[defaultLocale];
            const identifier = Utils.guid();

            popupMetadata = this.copyMetadata(defaultPopupMetadata, {
                contentKey: `${documentsPath}/${identifier}`
            });

            localizedPopupContract.locales[requestedLocale] = popupMetadata;

            await this.objectStorage.updateObject(popupKey, localizedPopupContract);
        }
        else if (!popupMetadata.contentKey) {
            const identifier = Utils.guid();
            popupMetadata.contentKey = `${documentsPath}/${identifier}`;
            await this.objectStorage.updateObject(popupKey, popupMetadata);
        }

        await this.objectStorage.updateObject(popupMetadata.contentKey, content);
    }
}