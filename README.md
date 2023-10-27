# Now natively supported in Steam.
Steam nativaly integrated similar functions, as mentionned in this [update](https://store.steampowered.com/oldnews/143476); and removed the exposed API that was allowing this app to work. _Bittersweet!_

---


# Steam : Game Finder ![version](https://img.shields.io/badge/dynamic/json?color=ed1e79&label=version&query=version&url=https://github.com/Nebukam/steam-game-finder/raw/main//package.json) ![release](https://img.shields.io/badge/license-MIT-black.svg)


## Browser extension

## - [:package: **Chrome**](https://chrome.google.com/webstore/detail/steam-game-finder/aagflcmpdhjkbgmbjmidndegeabadeip)
## - [:package: **Edge**](https://microsoftedge.microsoft.com/addons/detail/steam-game-finder/okpoofcmlpdkbogkmnlmpemgkfalebkp)
## - [:package: **Firefox**](https://addons.mozilla.org/en-US/firefox/addon/steam-game-finder/)

> Depending on review time, there can be a discrepancy between the github version and the published version.

## - [:zap: **Web app**](https://nebukam.github.io/steam-game-finder/pwa/) 
#### *(May be broken from time to time)*
> While the app is always up to date, it has a major caveat : it's using a [glitch server](https://glitch.com/edit/#!/steam-game-finder-server) to fetch data (and thus is slower and subjected to quotas). As a consequence, it cannot leverage the fact that a user is signed-in to steamcommunity.com to fetch private/friends profiles.

## Main Features
### - Filter games owned by a group of users you can toggle on/off
You can add users by their cosmetic ID (if they set-up one), steamID, or directly pasting their profile' URL in the add field.

![Landing page](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/001.png)

Once you added a user (likely yourself), you can easily find your friends, or friends of friends using the **friendlist** button.  

![Friendlist view](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/002.png)

### - Essential filters focusing on multiplayer features
Also includes filters from [Co-optimus](https://www.co-optimus.com/), as well as size on disk!

![Filter view](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/003.png)
> :warning: Activating Co-optimus filters will greatly reduce the number of results, as data is available for "only" 2285 games. *(airquotes as it is already a titanesque job since it's maintained manually)*

### - Comprehensive view of game by number of owners
A more flexible view showing more options by number of owners, instead of showing only exact overlaps. Quickly naviguate through groups using the shortcuts on the left.
![Owner groups](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/004.png)
Fetch the price of games people of in your group don't own yet
![Fetch price](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/005.png)

### - Works on mobile (but not _designed_ for it)

![Mobile screenshots](https://github.com/Nebukam/steam-game-finder/raw/main/assets/screenshots/mobile.png)

## Filter details
The filters are using a dump from Steam & Cooptimus databases available [here](https://github.com/Nebukam/steam-db).


(More TBD)

# Special thanks
Special thanks to [@andrasfuchs](https://github.com/andrasfuchs) whom feedback & support made this app better for everyone ^_^  
And thanks to anyone in the Steam Community forums for their comments and suggestions.

# Disclaimers

## Steam

This app is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Steam or any of its subsidiaries or its affiliates.  
The official Steam website can be found at [https://store.steampowered.com/](https://store.steampowered.com/)

## Co-optimus

This app is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Co-optimus, or any of its subsidiaries or its affiliates.  
The official Steam website can be found at [https://www.co-optimus.com/](https://www.co-optimus.com/)
