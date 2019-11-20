from tkinter import *

WIDTH=600
HEIGHT=400
SIZE=30
BGCOLOR='lightyellow'
posx=0
posy=0
incx=1
incy=1

tk = Tk()
tk.title('Test TK')
canvas = Canvas(tk,width=WIDTH,height=HEIGHT,bg=BGCOLOR)
canvas.pack()

class Square():
    def __init__(self, x, y, size, color):
        self.shape = canvas.create_rectangle(x,y,x+size,y+size,fill=color,tags=('square'))

def squareGenerator():
    global posx
    global posy
    global incx
    global incy
    canvas.delete('square')
    Square(posx, posy, SIZE, '#444')
    posx+=incx
    posy+=incy
    if posx+SIZE>=WIDTH:
        incx=-1
    if posx<=0:
        incx=1
    if posy+SIZE>=HEIGHT:
        incy=-1
    if posy<=0:
        incy=1
    tk.after(50,squareGenerator)

# a = Button(tk, text="Restart", command=squareGenerator)
# a.place(x = WIDTH/2, y = HEIGHT/2)
# canvas.create_rectangle(0,0,WIDTH,HEIGHT,fill=BGCOLOR)
tk.after(10,squareGenerator)
tk.mainloop()