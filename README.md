# TSDiscogsTool

Tool to talk to Discogs API V2

Currently Only Supports Personal Access Key, Key/Secret will be supported in 0.0.2 and oAuth2 in 0.0.3

v0.0.1 only supports GET endpoints
v0.0.2 will support PUT, POST, DELETE endpoints and add Key:Secret
v0.0.3 will add oAuth Access

## To Display Full Headers

`console.log(data.headers)`

## To Display RateLimit Information

`console.log(discogs.getRatelimit());`

## Access Endpoints

Users should set Discogs Username in .env file

Discogs Personal Access Key should be set in .env file

USER INFORMATION

`const user = await discogs.getUser();`

`const collection = await discogs.getUserCollection();`

`const wantlist = await discogs.getUserWantlist();`

`const folders = await discogs.getUserFolders();`

`const folderContents = await discogs.getUserFolderContents("1841753");`

`const collectionValue = await discogs.getUserCollectionValue();`

RELEASE INFORMATION

`const releaseDetails = await discogs.getRelease("249504");` //RICK-ROLL

`const releaseUserRating = await discogs.getReleaseUserRating("249504");`

`const releaseCommunityRating = await discogs.getReleaseCommunityRating( "8749543" );`

`const releaseStats = await discogs.getReleaseStats("249504");`

`const releaseMaster = await discogs.getMasterRelease("96559");`

`const releaseMasterVersions = await discogs.getMasterReleaseVersions("96559");`

ARTIST INFORMATION

`const artist = await discogs.getArtist("72872");` //RICK ASTLEY

`const artistReleases = await discogs.getArtistReleases("72872");`

LABEL INFORMATION

`const label = await discogs.getLabel("895");` //RCA

`const labelReleases = await discogs.getLabelReleases("895");`
