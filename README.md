# minilab-scripts
Midi Tools for my Arturia Minilab Mk II

## About

I use an Arturia Minilab Mk 2 to play some bass synths through Mainstage.

I was disappointed by how you can't control the pad lights from Mainstage out of the box.

So, I did some research, wrote some javacript and lua scripts, and now have pretty decent control over my pad lights from Mainstage.

## What you need to make this work

- A Minilab Mk II
- [Install CTRLR as a plugin in your DAW](https://ctrlr.org/nightly/)

I haven't tried this with a windows DAW, but I suspect the javascript for Mainstage should work for other DAWs with some modification.

## On a Mac
1. Download CTRLR from the link above
2. Copy the `ctrlr.component` file to `/Library/Application Support/Audio/PLug-Ins/Components`
