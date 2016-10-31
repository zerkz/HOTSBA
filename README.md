# HOTSBA - **H**eroes **o**f **t**he **S**torm **B**an **A**id
[![Build Status](https://travis-ci.org/zerkz/HOTSBA.svg?branch=master)](https://travis-ci.org/zerkz/HOTSBA)
[![Build status](https://ci.appveyor.com/api/projects/status/qyvtkswriw4x0uyo?svg=true)](https://ci.appveyor.com/project/zerkz/hotsba)

## Downloads
* [Windows x64](https://goo.gl/WVWLUi)
* [OS X](https://goo.gl/XB5SYt)

![screenshot](https://drive.google.com/uc?export=download&id=0BwufwJ0RwTiccUtZNWdPQWN0dFk)

# FAQ

## How Do I Use HOTSBA?
Download an installer from above, run it! After sometime (and update checking), HOTSBA will appear.

Simply click in a textbox under "Player", enter in someones name, hit "TAB", and it will query for their rankings/most played/skilled heroes!

Repeat until you have the enemy team mapped out! Also available is an "Allies" team, incase you want to see what they play!

## What benefit do I gain over HotsStats/HotsLogs Uploader?
HOTSBA is meant to be used during the draft phase. Both of the above tools currently do not present any information until the loading screen/after draft has happened.

## WTF does HOTSBA it stand for?
Heroes Of The Storm Ban Aid. Used to be named hotsMPH (most played heroes). The name allowed me
to make the atrocious icon you see :P

## Does HOTSLOGS know about this?
I've been communicating with Ben from HOTSLOGS. And I got his permission for the "Powered By" snippet at the footer. Without data from HOTSLOGS, this tool would be nothing, so props to him!

## Will I get banned for using this?
Never say never, but this is no different than loading up HOTSLOGS.com, and searching your enemies at the draft screen. HOTSBA does not read memory, or interact with the HOTS executable in any way.

## Can't you make it so I don't have to type in the names of players?
No. This involves reading memory or doing some sort of insane pixel OCR. Stop being lazy,
type in a name, hit tab, repeat.

## Will this make me good?
Maybe? Personally, I hit Grandmaster without it, but they say "know your enemy".
It's a common tactic in the competitive scene to ban heroes that players have gathered
reputation for. This is why the pros know how to play many heroes!

My #1 piece of advice? Work with your team, even if they are raging/being obnoxious. Save criticism for after the game.

## Why is the Windows installer gif so strange/weird. ARE YOU HACKING MY COMPUTER?
It's based upon Squirrel. I learned about all of this + build servers in nearly two days,
so I haven't had time to make a .gif that doesn't seem completely different from the HOTSBA theme.

Designers feel free to come up with an nice gif to show during install!

## Dude... this icon....
I know. Just imagine it as an H next to a man trapped inside of a bandaid. #programmer_art

If you're a designer and you would like to help with some of the graphics, please reach out!

## How do I use a proxy?
Click configure proxy.

Fill out the info. Leave username and password blank if the proxy requires no authorization.

Make sure your URL includes http or https.

Hit save and restart, and all traffic (besides auto updates) should be going through your proxy once HOTSBA restarts.

*This will store your proxy configuration in plaintext on your computer.*

# Feedback
Please send feedback/suggestions to [admin@hotsba.com](admin@hotsba.com)

# Can I Donate?
Sure! I incurred some costs, like getting an Apple Developer subscription so that the OS X auto updater would work (apps must be signed!)

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JNFF7KKQLGVC4)

# Developer Stuff

## NPM scripts
* npm start - starts up HOTSBA locally, in development mode (auto updater is diabled..)
* npm run genTemplates - generates all of the mustache templates in `app/ui/templates`
* npm run dist - builds installers, for your current platform.

# Shoutouts
Thanks to arc (some dev help), and all my friends who helped me test.

Thanks to Ben @ HOTSLOGS for being open and communicating with me!

Shoutouts to the players I commonly run into in TL or HL!
