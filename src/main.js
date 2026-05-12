// Aidan Ion
// Created: 5/4/26
//
// Space Evaders
//
// Gallery shooter game

// Art assets from Kenny Assets:
// https://kenney.nl/assets/

"use strict"

let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    width: 800,
    height: 600,
    scene: [SpaceEvaders]
}


const game = new Phaser.Game(config);