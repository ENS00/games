import datetime
import strategies
import random
import os
from strategies import Language as Language
from strategies import Card as Card

colors=('','\033[0;31m\033[1;103m','\033[0;30m\033[1;106m')
os.system('color 7')

def writeFile(file,str):
 with open(file,'a') as wFile:
  wFile.write(str)

class Player:
 def __init__(self,name=None,strategy=strategies.random):
  if not name:
   self.name='Player'
   self.defaultName=True
  else:
   self.name=name
   self.defaultName=False
  self.cards=[None,None,None]
  self.totalCards=[]
  self.strategy=strategy
 
 def play(self):
  if [None,None,None]!=self.cards:##None in self.cards: <-- not properly correct
   card=self.strategy(self.game,self.cards)
   self.cards[self.cards.index(card)]=None
   return card
  else:
   raise Exception(self.name+self.game.language.phrases[6])
 
 def setGame(self,game):
  self.game=game
  if self.game and (not self.name or self.defaultName):
   self.name=self.game.language.phrases[0]+' '+next(self.game.idMaker)
   self.defaultName=True
  elif not self.game and (not self.name or self.defaultName):
   self.name='Player'
   self.defaultName=True
 
 def draw(self):
  try:
   emptyPos=self.cards.index(None)
   cardPicked=self.game.deck.pick()
   if cardPicked:
    cardPicked.player=self
    self.cards[emptyPos]=cardPicked
   elif not self.game.briscola.player:
    self.game.briscola.player=self
    self.cards[emptyPos]=self.game.briscola
  except ValueError:
   raise ValueError(self.name+self.game.language.phrases[6])
 
 def calculatePoints(self):
  ret=0
  for card in self.totalCards:
   ret+=card.points
  return ret
##End of Player
class Deck:
 def __init__(self,game):
  self.cards=[]
  self.game=game
  for i in range(40):
   self.cards.append(Card(self,i//10,i%10))
 
 def shuffle(self):
  mydate=datetime.datetime.now().strftime('%f')
  self.cards.sort(key=lambda b: self.game.customRandom())
  while mydate==datetime.datetime.now().strftime('%f'):
   continue
  self.cards.sort(key=lambda b: self.game.customRandom())
  self.game.comment(self.game.language.phrases[2])
 
 def pick(self):
  if len(self.cards)>0:
   return self.cards.pop()
##End of Deck
class IdMaker:
 def __init__(self,max=10000,start=1):
  self.max=max
  self.start=start
 
 def __iter__(self):
  self.a = self.start
  return self

 def __next__(self):
  self.a+=1
  if self.a>=self.max:
   self.a = self.start
  return self.a
##End of IdMaker
class Game:
 def __init__(self,player1,player2,lang=Language(),file=None):
  self.manchesRemaning=17
  self.language=lang
  self.table=[]
  self.idMaker=iter(IdMaker(2))
  self.deck=Deck(self)
  self.allCards=tuple(self.deck.cards)
  if not player1:
   self.player1=Player()
  else:
   self.player1=Player(player1['name'],player1['strategy'])
  self.player1.setGame(self)
  if not player2:
   self.player2=Player()
  else:
   self.player2=Player(player2['name'],player2['strategy'])
  self.player2.setGame(self)
  if file:
   self.comment=lambda str,i=0: writeFile(file,str+'\r')
  else:
   self.comment=lambda str,i=0: print(colors[i]+str+'\033[00m')
 
 def customRandom(b):
  return random.random()##round(random.random()*2-1)
 
 def getCardsRevealed(self):
  return tuple(filter(lambda a: a not in self.deck.cards+self.player1.cards+self.player2.cards,self.allCards))
 
 def start(self):
  self.comment(self.language.phrases[1],1)
  self.deck.shuffle()
  for i in range(3):
   self.player1.draw()
   self.comment(self.player1.name+self.language.phrases[3]+self.language.phrases[4])
   self.player2.draw()
   self.comment(self.player2.name+self.language.phrases[3]+self.language.phrases[4])
  self.briscola=self.deck.pick()
  self.comment(self.language.phrases[7]+self.briscola.completeName,2)
  self.turn=self.player1
  while len(self.deck.cards)>0:
   self.playTurn()
   self.manchesRemaning-=1
  for i in range(3):
   self.playTurn()
  p1=self.player1.calculatePoints()
  p2=self.player2.calculatePoints()
  self.comment(self.player1.name+self.language.phrases[9]+str(p1)+self.language.phrases[10],1)
  self.comment(self.player2.name+self.language.phrases[9]+str(p2)+self.language.phrases[10],1)
  if p1>p2:
   self.comment(self.player1.name+self.language.phrases[11]+'\r',2)
  elif p2>p1:
   self.comment(self.player2.name+self.language.phrases[11]+'\r',2)
  else:
   self.comment(self.player1.name+self.language.phrases[12]+self.player2.name+self.language.phrases[13]+'\r',2)
 
 def playCard(self,card):
  self.table.append(card)
  self.comment(card.player.name+self.language.phrases[8]+card.completeName)
 
 def playTurn(self):
  #self.debug()##
  if self.turn==self.player1:
   self.playCard(self.player1.play())
   self.playCard(self.player2.play())
  else:
   self.playCard(self.player2.play())
   self.playCard(self.player1.play())
  winner=Card.max(self.table[0],self.table[1],self.briscola)
  winner.player.totalCards.append(self.table.pop())
  winner.player.totalCards.append(self.table.pop())
  self.turn=winner.player
  if len(self.deck.cards)>0:
   temp=not self.briscola.player
   if self.turn==self.player1:
    self.player1.draw()
    self.comment(self.player1.name+self.language.phrases[3]+self.language.phrases[4])
    self.player2.draw()
    if len(self.deck.cards)==0 and temp:
     self.comment(self.player2.name+self.language.phrases[3]+self.language.phrases[14]+self.briscola.completeName,1)
    else:
     self.comment(self.player2.name+self.language.phrases[3]+self.language.phrases[4])
   else:
    self.player2.draw()
    self.comment(self.player2.name+self.language.phrases[3]+self.language.phrases[4])
    self.player1.draw()
    if len(self.deck.cards)==0 and temp:
     self.comment(self.player1.name+self.language.phrases[3]+self.language.phrases[14]+self.briscola.completeName,1)
    else:
     self.comment(self.player1.name+self.language.phrases[3]+self.language.phrases[4])
  self.comment('----------')
 
 def debug(self):
  self.comment(self.player1.name+': ['+str(self.player1.cards[0])+', '+str(self.player1.cards[1])+', '+str(self.player1.cards[2])+']')
  self.comment(self.player2.name+': ['+str(self.player2.cards[0])+', '+str(self.player2.cards[1])+', '+str(self.player2.cards[2])+']')
  #self.comment('RevealedCards: '+str(self.getCardsRevealed()))
  self.comment('----------')
  os.system('pause')
##End of Game

##modify here!
frasi=('Giocatore','Inizia una nuova partita!','Il mazzo è stato mescolato',' pesca ','una carta',' ha la mano piena!',' non ha carte in mano!','La briscola scelta è il ',' gioca ',' ha totalizzato ',' punti!',' vince!',' e ',' hanno pareggiato!','il ')
classic=Language('it',('bastoni','coppe','denari','spade'),('asso','due','tre','quattro','cinque','sei','sette','fante','cavallo','re'),'di',frasi)
italian=Language('it',('legno','pietra','diamanti','ferro'),('dio','schiavo','fuorilegge','povero','prete','mago','nobile','cavaliere','re','dittatore'),'di',frasi)
game=Game({'name':'Principiante','strategy':strategies.rookie},{'name':'Pro','strategy':strategies.pro},classic)
game.start()