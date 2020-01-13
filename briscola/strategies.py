import random

class Language:
 def __init__(self,name='en',seeds=('woods','foods','golds','stones'),names=('god','slave','outlaw','poor','priest','artist','noble','knight','king','emperor'),conj='of',phrases=None):
  self.name=name
  if len(seeds)==4:
   self.seeds=tuple(map(lambda str: str[0].upper()+str[1:],seeds))
  else:
   raise TypeError('Invalid seeds specified')
  self.conj=conj
  if len(names)==10:
   self.names=tuple(map(lambda str: str[0].upper()+str[1:],names))
  else:
   raise TypeError('Invalid names for the cards specified')
  if phrases==None:
   self.phrases=('Player','Game starts!','Deck was shuffled',' draws ','a card','\'s hand is full!',' has no cards!','The choosen briscola is the ',' plays ',' totalized ',' points!',' wins!',' and ',' got a draw!','the ')
  else:
   self.phrases=phrases
##End of Language
class Card:
 def __init__(self,deck,seed,number):
  self.points=Card.calcPoints(number)
  self.deck=deck
  self.completeName=Card.getCompleteName(deck.game.language,seed,number)
  self.seed=seed
  self.number=number
  self.player=None
 
 @staticmethod
 def calcPoints(number):
  if number==0:
   return 11
  elif number==2:
   return 10
  elif number==9:
   return 4
  elif number==8:
   return 3
  elif number==7:
   return 2
  return 0
 
 @staticmethod
 def getCompleteName(lang=Language(),seed=None,number=None):
  if isinstance(seed,int) and isinstance(number,int):
   return lang.names[number]+' '+lang.conj+' '+lang.seeds[seed]
 
 def __str__(self):
  return Card.getCompleteName(self.deck.game.language,self.seed,self.number)
 
 def __repr__(self):
  return Card.getCompleteName(self.deck.game.language,self.seed,self.number)
 
 @staticmethod
 def max(card1,card2,briscola,order=(1,3,4,5,6,7,8,9,2,0),firstBriscolaSeed=True):
  if not card1:
   if not card2:
    return None
   else:
    return card2
  if not card2:
   return card1
  electedSeed=briscola.seed
  if firstBriscolaSeed:
   if card1.seed==electedSeed:
    if card2.seed==electedSeed:
     if order.index(card2.number)>order.index(card1.number):
      return card2
     else:
      return card1
    else:
     return card1
   elif card2.seed==electedSeed:
    return card2
   elif card1.seed==card2.seed and order.index(card2.number)>order.index(card1.number):
    return card2
   else:
    return card1
  else:
   if card1.seed!=electedSeed:
    if card2.seed!=electedSeed:
     if order.index(card2.number)>order.index(card1.number):
      return card2
     else:
      return card1
    else:
     return card1
   elif card2.seed!=electedSeed:
    return card2
   elif card1.seed==card2.seed and order.index(card2.number)>order.index(card1.number):
    return card2
   else:
    return card1
	
 def maxInList(listOfCards,briscola,order=(1,3,4,5,6,7,8,9,2,0),firstBriscolaSeed=False):
  strongestCard=listOfCards[0]
  for i in range(len(listOfCards)-1):
   strongestCard=Card.max(strongestCard,listOfCards[i+1],briscola,order,firstBriscolaSeed)
  return strongestCard
##End of Card

##HELP 4 STRATEGIES
def filterSeed(cards,seed):
 return tuple(filter(lambda a: a and a.seed==seed,cards))
 
def filterCards(cards,condition):
 return tuple(filter(condition,cards))

#'-___-
def getNumber(a,default=-1):
 if a:
  return a.number
 else:
  return default

def cardOrder(cards,order=(1,3,4,5,6,7,8,9,2,0)):
 mycards=list(cards)
 mycards.sort(key=lambda b: order.index(getNumber(b,order[0])))
 return mycards
 

##STRATEGIES
def random(game,cards):
 myRandom=round(random.random()*len(cards))
 while cards[myRandom]==None:
  myRandom=round(random.random()*len(cards))
 return myRandom

def aggressive(game,cards):
 cards=cardOrder(cards)
 card=cards[0]
 for i in range(1,len(cards)):
  card=Card.max(card,cards[i],game.briscola)
 return card
 
def astute(game,cards):
 cards=cardOrder(cards,(0,2,9,8,7,6,5,4,3,1))
 card=cards[0]
 for i in range(1,len(cards)):
  card=Card.max(card,cards[i],game.briscola,(0,2,9,8,7,6,5,4,3,1),False)
 return card

def hasNoSeedInHand(game,cards,prob=10):
 knownCards=game.getCardsRevealed()+tuple(cards)
 seeds=[0,0,0,0]
 for i in range(4):
  seeds[i]=sum((card!=None and card.seed == i) for card in knownCards)
 seeds=filterCards(seeds,lambda a: a>=prob and filterSeed(cards,a))
 if seeds:
  return random(game,seeds)
 return tuple()
 
def hasNoSpecificSeedInHand(game,cards,seed,prob=10):
 knownCards=game.getCardsRevealed()+tuple(cards)
 seeds=[0,0,0,0]
 for i in range(4):
  seeds[i]=sum((card!=None and card.seed == i) for card in knownCards)
 seeds=filterCards(seeds,lambda a: a>=prob and filterSeed(cards,seed))
 if seeds:
  return random(game,seeds)
 return tuple()

def rookie(game,cards):
 if len(game.table)==1:
  options=filterCards(cards,lambda a: a and a.seed==game.table[0].seed and Card.max(a,game.table[0],game.briscola)==a)
  if len(options)==0:
   options=filterCards(cards,lambda a: a and a.seed==game.briscola.seed)
  if len(options)==0:
   options=tuple([astute(game,cards)])
  mycard=options[0]
  if len(options)>1:
   if options[0].seed==game.table[0].seed:
    mycard=aggressive(game,options)
   else:
    mycard=astute(game,options)
  return mycard
 ## no cards in table
 options=filterCards(cards,lambda a: a and a.seed==game.briscola.seed)
 if len(options)==0:
  return astute(game,cards)
 else:
  return aggressive(game,options)
  
def pro(game,cards):
 if len(game.table)==1:
  lowestCard=Card.maxInList(cards,game.briscola,(0,2,9,8,7,6,5,4,3,1),True)
  if game.table[0].seed==game.briscola.seed and game.table[0].points==0 and lowestCard.points==0:
   return lowestCard
  if game.manchesRemaning==1 and game.table[0].points<10 and game.briscola.points==0 and Card.max(lowestCard,game.table[0],game.briscola)==game.table[0]:
   return lowestCard
  options=filterCards(cards,lambda a: a and a.seed==game.table[0].seed and Card.max(a,game.table[0],game.briscola)==a)
  if len(options)==0 and (game.table[0].points>2 or len(filterCards(cards,lambda a: a and a.points>=10 and a.seed!=game.briscola.seed))==2) and (game.table[0].seed!=game.briscola.seed or Card.maxInList(cards+game.table,game.briscola)!=game.table[0]):
   options=filterCards(cards,lambda a: a and a.seed==game.briscola.seed and Card.max(a,game.table[0],game.briscola)==a)
  if len(options)==0:
   options=filterCards(cards,lambda a: a and a.points==0)
  if len(options)==0:
   return astute(game,cards)
  mycard=options[0]
  if len(options)>1:
   options=filterCards(options,lambda a: a.seed!=game.briscola and Card.max(a,game.table[0],game.briscola)==a)
   if len(options)>0:
    mycard=aggressive(game,options)
   elif game.table[0].points>2:
    options=filterCards(options,lambda a: a.seed==game.briscola and Card.max(a,game.table[0],game.briscola)==a)
    if len(options)>0:
     mycard=aggressive(game,options)
    else:
     mycard=astute(game,cards)
   else:
    mycard=astute(game,cards)
  return mycard
 ## no cards in table
 if hasNoSpecificSeedInHand(game,cards,game.briscola):
  knownCards=game.getCardsRevealed()
  electedCard=Card.maxInList(cards,game.briscola.seed)
  if electedCard.number == 0:# has an A
   return electedCard
  elif electedCard.number == 2 and len(filterCards(knownCards,lambda a: a and electedCard.seed==a.seed and a.number==0))==1:
   return electedCard
  elif electedCard.number == 9 and len(filterCards(knownCards,lambda a: a and electedCard.seed==a.seed and (a.number==0 or a.number==2)))==2:
   return electedCard
  elif electedCard.number == 8 and len(filterCards(knownCards,lambda a: a and electedCard.seed==a.seed and (a.number==0 or a.number==2 or a.number==9)))==3:
   return electedCard
  elif electedCard.number == 7 and len(filterCards(knownCards,lambda a: a and electedCard.seed==a.seed and (a.number==0 or a.number==2 or a.number>=8)))==4:
   return electedCard
 options=filterCards(cards,lambda a: a and a.seed!=game.briscola.seed and a.seed==hasNoSeedInHand(game,cards))
 if len(options)==0 and game.manchesRemaning>4:
  options=filterCards(cards,lambda a: a and a.seed!=game.briscola.seed and a.seed==hasNoSeedInHand(game,cards,9))
 if len(options)==0 and game.manchesRemaning>6:
  options=filterCards(cards,lambda a: a and a.seed!=game.briscola.seed and a.seed==hasNoSeedInHand(game,cards,8))
 if len(options)==0 and game.manchesRemaning>8:
  options=filterCards(cards,lambda a: a and a.seed!=game.briscola.seed and a.seed==hasNoSeedInHand(game,cards,7))
 if len(options)==0:
  return astute(game,cards)
 else:
  return astute(game,options)