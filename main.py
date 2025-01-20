# testing things for helping shylah with the idea

# setup
Card = SpriteKind.create()
bot = sprites.create(assets.image("bot"), SpriteKind.enemy)
bot.scale = 2
bot.y -= 20
table = sprites.create(assets.image("Table"))
table.z = 4
table.scale = 5
p_stood = False
b_stood = False
p_tot = 0
b_tot = 0
scene.set_tile_map_level(assets.tilemap("level"))
deck_list = [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,10]
# in theory deck is doable with only 1-10 once but this way feels nicer to the real game and technically includes card counting as a mechanic lol
p_hand: List[number] = []
b_hand: List[number] = []
shuffled_deck: List[number] = []
shuffle() # makecode not having pythons random.shuffle is so bad

def shuffle(): # what if we just make it work like an actual deck of cards, lets shuffle!
    p_hand: List[number] = []
    b_hand: List[number] = []
    deck_list = [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,10]
    while len(shuffled_deck) <= 40:
        blorb = deck_list[randint(0, len(deck_list)-1)]
        shuffled_deck.append(blorb)
        deck_list.remove_element(blorb)
        if len(deck_list) == 0:
            #console.log(len(shuffled_deck))
            break



cards = Dictionary.create([1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [assets.image("""
            1
            """),
        assets.image("""
            2
            """),
        assets.image("""
            3
            """),
        assets.image("""
            4
            """),
        assets.image("""
            5
            """),
        assets.image("""
            6
            """),
        assets.image("""
            7
            """),
        assets.image("""
            8
            """),
        assets.image("""
            9
            """),
        assets.image("""
            10
            """)])



def p_draw():
    global deck_list, p_hand
    # player drawing isn't different from bot drawing really, just fits nicer in two funcs
    #drawn_card = deck_list[randint(0, len(deck_list))] #  YOU! WHY? THAT'S SO RUDE
    #console.log("drawn card is " + drawn_card)
    drawn_card = shuffled_deck.pop()
    p_hand.append(drawn_card)
    #console.log("cards remaining in deck: " + len(shuffled_deck))
    #deck_list.remove_element(drawn_card)
    update_p_hand()
#controller.A.on_event(ControllerButtonEvent.PRESSED, p_draw)

def b_draw():
    drawn_card = shuffled_deck.pop()
    b_hand.append(drawn_card)
    update_b_hand()

def update_b_hand():
    card = sprites.create(assets.image("deck"), Card)
    card.scale = 1.5

def b_behaviour():
    global b_stood, b_tot
    if len(b_hand) == 1:
        b_tot = b_hand.pop()
        b_hand.append(b_tot)
        b_hand.append(0)
    else:
        to_add = b_hand.pop()
        b_tot += to_add
        b_hand.append(to_add)
    if b_tot >= 17:
        b_stood = True
    else:
        b_draw()
    #console.log("bots total is: " + b_tot)
    #console.log(b_hand)
    

# now for the screwy bit

def update_p_hand():
    card_to_add = p_hand.pop() # turns pop works on the main list even if it's not global what the hell
    p_hand.append(card_to_add) # figure out why this comes up undefined sometimes... it breaks the dict
    card = sprites.create(assets.image("deck"), Card)
    card.set_image(Dictionary.get_value(cards, card_to_add)) # thanks Lew!
    #card.set_flag(SpriteFlag.RELATIVE_TO_CAMERA, True) # relative to camera means no overlap
    card.set_position(80, 90) #just makes the cards centred a little bit
    card.scale = 2 # too small at the start
    card.z = 10

def hand_disp(card1, card2): # such a shoddy way of doing it but hey, if it works it works
    card1.x -= 1
    card2.x +=1
sprites.on_overlap(Card, Card, hand_disp)

def p_total():
    global p_tot, p_stood

    if len(p_hand) == 1:
            p_tot = p_hand.pop()
            p_hand.append(p_tot)
    else:
        if not p_stood:
            to_add = p_hand.pop()
            p_tot += to_add
            p_hand.append(to_add)
    if p_tot > 20:
        game.splash("You're bust!!!")
        p_stood = True


# right, now to make the actual game lmaoo

# start the game by giving the player and bot 1 card each!
p_draw()
p_total()
#console.log("player total is: " + p_tot)
b_draw()

# and now we begin proper!
def game_loop():
    global p_stood, b_stood, b_tot, p_tot
    pause(1000)
    if p_stood == False:
        choice = game.ask("hit or stand?")
        if choice == True:
            p_draw()
            p_total()

        else:
            p_stood = True 
            p_total()
    if b_stood == False:
        b_behaviour()
    #console.log("player total is: " + p_tot)
    #console.log(b_stood)
    if b_stood and p_stood:
        checkwin() 
    game_loop()

def checkwin():
    p_bust = False
    b_bust = False
    if p_tot > 20:
        p_bust = True
    if b_tot > 20:
        b_bust = True
    if p_bust and b_bust or p_tot == b_tot:
        game.splash("it's a draw! Resetting...")
        game.game_over(False)
    npt = 20 - p_tot
    bpt = 20 - b_tot
    #console.log("player npt: " + npt)
    #console.log("bot bpt: " + bpt)
    if npt < bpt and p_bust == False:
        game.set_game_over_message(True, "You're closer to 20! You Win!")
        game.game_over(True)
    elif bpt < npt and b_bust == False:
        game.set_game_over_message(False, "The Bot is closer to 20! You Lose...")
        game.game_over(False)
    elif p_bust == False and b_bust == True:
        game.set_game_over_message(True, "You're closer to 20! You Win!")
        game.game_over(True)
    elif b_bust == False and p_bust == True:
        game.set_game_over_message(False, "The Bot is closer to 20! You Lose...")
        game.game_over(False)
game_loop()