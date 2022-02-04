import Dotenv from 'dotenv';
import Debug from 'debug';
import Fetch from 'node-fetch';

Dotenv.config();

const debug = Debug('discogs:info');

// console.info('Welcome To The Last Discogs API v2 Library You Will Ever Need')
console.info('JS TS Discogs API v2 Library Version 0.0.1')
console.info('© Dex Vinyl & Mike Elsmore 2022')
console.info('Released under MIT License')

interface Ratelimit {
    ratelimit: number,
    remaining: number,
    used: number,
}

export class Client {
    private protocol = 'https';
    private host: string;
    private port: number;
    private userAgent: string;
    private auth: string|null;
    private ratelimit: Ratelimit;
    private discogsUserName: string;
    private perPage: string;

    private defaults = {
        host: 'api.discogs.com',
        port: 443,
        userAgent: 'JSTSDiscogsAPIV2Library',
        apiVersion: 'v2',
        outputFormat: 'discogs',    // Possible values: 'discogs' / 'plaintext' / 'html'
        requestLimit: 25,           // Maximum number of requests to the Discogs API per interval
        requestLimitAuth: 60,       // Maximum number of requests to the Discogs API per interval when authenticated
        requestLimitInterval: 60000, // Request interval in milliseconds
        discogsUserName:' ', // Default Username can only be set in ENV file
        perPage:'50',
    }

    constructor({
        host,
        port,
        userAgent,
        token,
        key,
        secret,
        discogsUserName,
    }: {
        host?: string,
        port?: number;
        userAgent?: string;
        token?: string,
        key?: string,
        secret?: string,
        discogsUserName?: string,
    }) {
        this.discogsUserName = process.env.DISCOGS_USER_NAME || this.defaults.discogsUserName;
        this.host = host || this.defaults.host;
        this.port = port || this.defaults.port;
        this.userAgent = userAgent || this.defaults.userAgent;
        this.auth = this.createAuthString({ token, key, secret });
        this.ratelimit = {
            ratelimit: 25,
            remaining: 25,
            used: 0,
        };
        this.perPage = process.env.DISCOGS_PER_PAGE || this.defaults.perPage;
    }

    private createAuthString({
        token,
        key,
        secret,
    }: {
        token?: string,
        key?: string,
        secret?: string,
    }) {
        let authString;

        if (token || process.env.DISCOGS_API_TOKEN) {
            authString = `token=${(token || process.env.DISCOGS_API_TOKEN)}`;
        } else if ((key || process.env.DISCOGS_API_KEY) && (secret || process.env.DISCOGS_API_SECRET)) {
            authString = `key=${(key || process.env.DISCOGS_API_KEY)}, secret=${(secret || process.env.DISCOGS_API_SECRET)}`;
        }

        return authString || null;
    }

    private async request(path: string) {
        const requestHeaders: any = {
            'User-Agent': this.userAgent,
        };

        if (this.auth) {
            requestHeaders['Authorization'] = `Discogs ${this.auth}`
        }

        try {
            const response = await Fetch(`${this.protocol}://${this.host}/${path}`, {
                // method: 'post',
                // body: JSON.stringify({}),
                headers: requestHeaders,
            });
            const responseHeaders = response.headers;
            const data = await response.json();
            this.ratelimit = {
                ratelimit: Number(responseHeaders.get('x-discogs-ratelimit')),
                remaining: Number(responseHeaders.get('x-discogs-ratelimit-remaining')),
                used: Number(responseHeaders.get('x-discogs-ratelimit-used'))
            }
            return {
                data,
                headers: responseHeaders,
            };
        } catch (error) {
            console.error(error);
        }
    }

    public getRatelimit(): Ratelimit {
        return this.ratelimit;
    }

    // Helper Functions
    public getRequest (path: string) {
        return this.request(path);
    }

//
// HAVE A NAP
//

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

//
// CALCULATE RATE LIMIT
//

    public async calculateRateLimitRemaining(){
        let rateRemaining = this.getRatelimit().remaining;
        let rateBarrier = 2;//this.getRatelimit().ratelimit/5;
        let currentTime = new Date();
        await console.log ("You Have " + rateRemaining + " Requests Remaining");
        if ( rateRemaining <= rateBarrier ){
            await console.log ("You've Used ALL You API Rate Allowance, Waiting for 1 Minute");
            await console.log ("You Have " + rateRemaining + " Requests Remaining");
            await console.log ("The Threshold is " + rateBarrier + " Requests");
            await console.log (new Date());
            await this.delay(60000);
            await console.log ("Ok I Waited 1 Minute, Continuing... ");
            await console.log (new Date());
            await this.delay(1000);
            await console.log ("You Have " + this.getRatelimit().remaining + " Requests Remaining");
            // THIS IS INCORRECT! DATA NEEDS TO BE RE-GOT
            // IF DONE BY CALLING FOR EXAMPLE `getUser()` THIS WILL COST 1 API CALL
            // WE CAN NOT BE USING AN API CALL TO GET RATE-LIMIT INFORMATION
        }
    }

   
//
// USER SPECIFIC ENDPOINTS
//

    public async getUser() {
        return this.request(`users/${this.discogsUserName}`);
    }

    public async getUserCollection(pageNumber:string, sort:string, sortOrder:string) {
        const timeout = await this.calculateRateLimitRemaining();

        if (!pageNumber){
            pageNumber="1"
        }

        if (!sortOrder){
            sortOrder="desc"
        }

        if (!sort) {
            sort = "added"
        }
        else if (sort == "year") {}
        else if (sort == "artist") {}
        else if (sort == "title") {}
        else if (sort == "catno"){}
        else if (sort == "format") {}
        else if (sort == "rating") {}
        else{
            sort = "added"
        }

        return this.request(`users/${this.discogsUserName}/collection?sort=${sort}&sort_order=${sortOrder}&per_page=${this.perPage}&page=${pageNumber}`);
    }

    public async getUserWantlist(pageNumber:string, sort:string, sortOrder:string) {
        const timeout = await this.calculateRateLimitRemaining();

        if (!pageNumber){
            pageNumber="1"
        }

        if (!sortOrder){
            sortOrder="desc"
        }

        if (!sort) {
            sort = "added"
        }
        else if (sort == "year") {}
        else if (sort == "artist") {}
        else if (sort == "title") {}
        else if (sort == "catno"){}
        else if (sort == "format") {}
        else if (sort == "rating") {}
        else{
            sort = "added"
        }

        return this.request(`users/${this.discogsUserName}/wants?sort=${sort}&sort_order=${sortOrder}&per_page=${this.perPage}&page=${pageNumber}`);
    }

    public async getUserFolders() {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`users/${this.discogsUserName}/collection/folders`);
    }

    public async getUserFolderContents(folder:string, pageNumber:string, sort:string, sortOrder:string) {
        const timeout = await this.calculateRateLimitRemaining();

        if (!pageNumber){
            pageNumber="1"
        }

        if (!sortOrder){
            sortOrder="desc"
        }

        if (!sort) {
            sort = "added"
        }
        else if (sort == "year") {}
        else if (sort == "artist") {}
        else if (sort == "title") {}
        else if (sort == "catno"){}
        else if (sort == "format") {}
        else if (sort == "rating") {}
        else{
            sort = "added"
        }

        return this.request(`users/${this.discogsUserName}/collection/folders/${folder}/releases?sort=${sort}&sort_order=${sortOrder}&per_page=${this.perPage}&page=${pageNumber}`);
    }

    public async getUserCollectionValue() {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`users/${this.discogsUserName}/collection/value`);
    }
    
//
// RELEASE ENDPOINTS
//
    
    public async getRelease(releaseId: string) {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`releases/${releaseId}`);
    }

    public async getReleaseUserRating(releaseId: string) {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`releases/${releaseId}/rating/${this.discogsUserName}`);
    }

    public async getReleaseCommunityRating(releaseId: string) {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`releases/${releaseId}/rating`);
    }

    public async getReleaseStats(releaseId: string) {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`releases/${releaseId}/stats`);
    }

    public async getMasterRelease(masterId: string) {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`masters/${masterId}`);
    }

    public async getMasterReleaseVersions(masterId: string) {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`masters/${masterId}/versions`); // takes parameters, needs adding
    }

//
// ARTIST ENDPOINTS
//

    public async getArtistDetails(ArtistId: string) {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`artists/${ArtistId}`);
    }

    public async getArtistReleases(ArtistId: string, pageNumber:string, sort:string, sortOrder:string) {
        const timeout = await this.calculateRateLimitRemaining();

        if (!pageNumber){
            pageNumber="1"
        }

        if (!sortOrder){
            sortOrder="desc"
        }

        if (!sort) {
            sort = "title"
        }
        else if (sort == "year") {}
        else if (sort == "format") {}
        else{
            sort = "title"
        }

        return this.request(`artists/${ArtistId}/releases?sort=${sort}&sort_order=${sortOrder}&per_page=${this.perPage}&page=${pageNumber}`); // takes parameters, needs adding
    }

    
//
// LABEL ENDPOINTS
//

    public async getLabelDetails(LabelId: string) {
        const timeout = await this.calculateRateLimitRemaining();

        return this.request(`labels/${LabelId}`);
    }

    public async getLabelReleases(LabelId: string, pageNumber:string, sort:string, sortOrder:string) {
        const timeout = await this.calculateRateLimitRemaining();

        if (!pageNumber){
            pageNumber="1"
        }

        if (!sortOrder){
            sortOrder="desc"
        }

        if (!sort) {
            sort = "title"
        }
        else if (sort == "year") {}
        else if (sort == "artist") {}
        else if (sort == "catno"){}
        else if (sort == "format") {}
        else{
            sort = "added"
        }

        return this.request(`labels/${LabelId}/releases?sort=${sort}&sort_order=${sortOrder}&per_page=${this.perPage}&page=${pageNumber}`); // takes parameters, needs adding
    }

}
export default Client;