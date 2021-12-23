![version](https://img.shields.io/badge/dynamic/json?color=ed1e79&label=version&query=version&url=https://github.com/Nebukam/steam-game-finder/raw/main//package.json)
![release](https://img.shields.io/badge/license-MIT-black.svg)

# Steam : Game Finder

## Browser extension

## - [:package: **Chrome**](https://chrome.google.com/webstore/detail/steam-game-finder/aagflcmpdhjkbgmbjmidndegeabadeip)
## - [:package: **Edge**](https://microsoftedge.microsoft.com/addons/detail/steam-game-finder/okpoofcmlpdkbogkmnlmpemgkfalebkp)
## - [:package: **Firefox**](https://addons.mozilla.org/en-US/firefox/addon/steam-game-finder/)

> :warning: Depending on review time, there can be a discrepancy between the github version and the published version.

## - [:zap: **Browser App**](https://nebukam.github.io/steam-game-finder/pwa/)
> :frog: While the app is always up to date, it has two caveats : it's using an external server to fetch data (and thus is slower and subjected to quotas), and as a consequence cannot leverage the fact that a user is signed-it to steamcommunity.com to fetch friend profile infos.

## Main Features
### - Filter games owned by a group of users you can toggle on/off
Once you added a user (likely yourself), you can easily find friends of friends using the **friendlist** button.

![Landing page](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/001.png)
![Friendlist view](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/002.png)

### - Essential filters focusing on multiplayer features
Also includes filters from [Co-optimus](https://www.co-optimus.com/) !

![Filter view](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/003.png)
> :warning: Activating Co-optimus filters will greatly reduce the number of results produced by the filters, as data is available for "only" 2285 games. *(airquotes as it is already a titanesque job since it's maintained manually)*

### - Comprehensive view of game by number of owners
A more flexible view showing more options by number of owners, instead of only showing exact overlaps. Quickly naviguate through group using the shortcuts on the left.
![Owner groups](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/004.png)

## Filter details
The filters are using a dump from Steam & Cooptimus databases available [here](https://github.com/Nebukam/steam-db).


(More TBD)