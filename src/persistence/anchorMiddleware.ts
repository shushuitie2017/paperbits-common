import * as Utils from "../core/utils";
import { IObjectStorageMiddleware } from "./IObjectStorageMiddleware";
import { IPermalinkService } from "../permalinks/IPermalinkService";
import { IPageService } from "../pages/IPageService";
import { IRouteHandler } from "../routing/IRouteHandler";

/**
 * We have to use middleware because anchors might be inserted/deleted as part of larger text block (copy-pasting).
 */
export class AnchorMiddleware implements IObjectStorageMiddleware {
    private readonly permalinkService: IPermalinkService;
    private readonly pageService: IPageService;
    private readonly routeHandler: IRouteHandler;

    constructor(permalinkService: IPermalinkService, pageService: IPageService, routeHandler: IRouteHandler) {
        this.permalinkService = permalinkService;
        this.pageService = pageService;
        this.routeHandler = routeHandler;
    }

    public async applyChanges(key: string, changesObject: Object): Promise<void> {
        // console.log("Calling middleware...");
        // // console.log(changesObject);

        // let currentUrl = this.routeHandler.getCurrentUrl();
        // let permalink = await this.permalinkService.getPermalinkByUrl(currentUrl);
        // let pageKey = permalink.targetKey;
        // let pageContract = await this.pageService.getPageByKey(pageKey);


        // const headingNodes = Utils.findNodesRecursively(node => node["type"] && node["type"] === "heading-one", changesObject);

        // const promises = headingNodes.map(async headingNode => {
        //     if (headingNode["data"] && headingNode["data"]["categories"] && headingNode["data"]["categories"]["anchorKey"]) {
        //         return;
        //     }

        //     console.log(headingNode);

        //     const anchorPermalink = await this.permalinkService.createPermalink(`#myanchor`, null);

        //     Object.assign(headingNode, {
        //         data: {
        //             categories: {
        //                 anchorKey: anchorPermalink.key
        //             }
        //         }
        //     });

        //     let anchors = pageContract.anchors || {};

        //     anchors[anchorPermalink.key] = "Heading";

        //     pageContract.anchors = anchors;

        //     // await this.pageService.updatePage(pageContract);
        // });

        // await Promise.all(promises);

        // // console.log(pageContract);
    }
}


// export class UploadsMiddleware implements IObjectStorageMiddleware {
//     // if (key.startsWith("uploads/")) { // Uploads middleware?
//     //     this.underlyingStorage.addObject(key, dataObject);
//     // }

//     public applyChanges(key: string, target: Object, dataObject: Object): void

//     }
// }