//  testing things for helping shylah with the idea
//  setup
let Card = SpriteKind.create()
let bot = sprites.create(assets.image`bot`, SpriteKind.Enemy)
bot.scale = 2
bot.y -= 20
let table = sprites.create(assets.image`Table`)
table.z = 4
table.scale = 5
let p_stood = false
let b_stood = false
let p_tot = 0
let b_tot = 0
scene.setTileMapLevel(assets.tilemap`level`)
let deck_list = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10]
//  in theory deck is doable with only 1-10 once but this way feels nicer to the real game and technically includes card counting as a mechanic lol
let p_hand : number[] = []
let b_hand : number[] = []
let shuffled_deck : number[] = []
shuffle()
//  makecode not having pythons random.shuffle is so bad
function shuffle() {
    let blorb: number;
    //  what if we just make it work like an actual deck of cards, lets shuffle!
    let p_hand : number[] = []
    let b_hand : number[] = []
    let deck_list = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10]
    while (shuffled_deck.length <= 40) {
        blorb = deck_list[randint(0, deck_list.length - 1)]
        shuffled_deck.push(blorb)
        deck_list.removeElement(blorb)
        if (deck_list.length == 0) {
            // console.log(len(shuffled_deck))
            break
        }
        
    }
}

let cards = Dictionary.create([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [assets.image`
            1
            `, assets.image`
            2
            `, assets.image`
            3
            `, assets.image`
            4
            `, assets.image`
            5
            `, assets.image`
            6
            `, assets.image`
            7
            `, assets.image`
            8
            `, assets.image`
            9
            `, assets.image`
            10
            `])
function p_draw() {
    
    //  player drawing isn't different from bot drawing really, just fits nicer in two funcs
    // drawn_card = deck_list[randint(0, len(deck_list))] #  YOU! WHY? THAT'S SO RUDE
    // console.log("drawn card is " + drawn_card)
    let drawn_card = shuffled_deck.pop()
    p_hand.push(drawn_card)
    // console.log("cards remaining in deck: " + len(shuffled_deck))
    // deck_list.remove_element(drawn_card)
    update_p_hand()
}

// controller.A.on_event(ControllerButtonEvent.PRESSED, p_draw)
function b_draw() {
    let drawn_card = shuffled_deck.pop()
    b_hand.push(drawn_card)
    update_b_hand()
}

function update_b_hand() {
    let card = sprites.create(assets.image`deck`, Card)
    card.scale = 1.5
}

function b_behaviour() {
    let to_add: number;
    
    if (b_hand.length == 1) {
        b_tot = b_hand.pop()
        b_hand.push(b_tot)
        b_hand.push(0)
    } else {
        to_add = b_hand.pop()
        b_tot += to_add
        b_hand.push(to_add)
    }
    
    if (b_tot >= 17) {
        b_stood = true
    } else {
        b_draw()
    }
    
}

// console.log("bots total is: " + b_tot)
// console.log(b_hand)
//  now for the screwy bit
function update_p_hand() {
    let card_to_add = p_hand.pop()
    //  turns pop works on the main list even if it's not global what the hell
    p_hand.push(card_to_add)
    //  figure out why this comes up undefined sometimes... it breaks the dict
    let card = sprites.create(assets.image`deck`, Card)
    card.setImage(Dictionary.get_value(cards, card_to_add))
    //  thanks Lew!
    // card.set_flag(SpriteFlag.RELATIVE_TO_CAMERA, True) # relative to camera means no overlap
    card.setPosition(80, 90)
    // just makes the cards centred a little bit
    card.scale = 2
    //  too small at the start
    card.z = 10
}

sprites.onOverlap(Card, Card, function hand_disp(card1: Sprite, card2: Sprite) {
    //  such a shoddy way of doing it but hey, if it works it works
    card1.x -= 1
    card2.x += 1
})
function p_total() {
    let to_add: number;
    
    if (p_hand.length == 1) {
        p_tot = p_hand.pop()
        p_hand.push(p_tot)
    } else if (!p_stood) {
        to_add = p_hand.pop()
        p_tot += to_add
        p_hand.push(to_add)
    }
    
    if (p_tot > 20) {
        game.splash("You're bust!!!")
        p_stood = true
    }
    
}

//  right, now to make the actual game lmaoo
//  start the game by giving the player and bot 1 card each!
p_draw()
p_total()
// console.log("player total is: " + p_tot)
b_draw()
//  and now we begin proper!
function game_loop() {
    let choice: boolean;
    
    pause(1000)
    if (p_stood == false) {
        choice = game.ask("hit or stand?")
        if (choice == true) {
            p_draw()
            p_total()
        } else {
            p_stood = true
            p_total()
        }
        
    }
    
    if (b_stood == false) {
        b_behaviour()
    }
    
    // console.log("player total is: " + p_tot)
    // console.log(b_stood)
    if (b_stood && p_stood) {
        checkwin()
    }
    
    game_loop()
}

function checkwin() {
    let p_bust = false
    let b_bust = false
    if (p_tot > 20) {
        p_bust = true
    }
    
    if (b_tot > 20) {
        b_bust = true
    }
    
    if (p_bust && b_bust || p_tot == b_tot) {
        game.splash("it's a draw! Resetting...")
        game.gameOver(false)
    }
    
    let npt = 20 - p_tot
    let bpt = 20 - b_tot
    // console.log("player npt: " + npt)
    // console.log("bot bpt: " + bpt)
    if (npt < bpt && p_bust == false) {
        game.setGameOverMessage(true, "You're closer to 20! You Win!")
        game.gameOver(true)
    } else if (bpt < npt && b_bust == false) {
        game.setGameOverMessage(false, "The Bot is closer to 20! You Lose...")
        game.gameOver(false)
    } else if (p_bust == false && b_bust == true) {
        game.setGameOverMessage(true, "You're closer to 20! You Win!")
        game.gameOver(true)
    } else if (b_bust == false && p_bust == true) {
        game.setGameOverMessage(false, "The Bot is closer to 20! You Lose...")
        game.gameOver(false)
    }
    
}

game_loop()
