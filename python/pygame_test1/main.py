# Lorenzo Tomasello 18/02/2020
# Test 1: move a rect in a determined space, performance comparison between multiple different methods
import pygame
# pygame.init()
fps = int(1000/60)
screen = pygame.display.set_mode((400, 400))
screen.fill((0, 255, 255))
pygame.display.flip()
positions = ([30, 30],
             [130, 30],
             [130, 100],
             [30, 100])
myrect = pygame.draw.polygon(screen, (255, 0, 0), positions)
pygame.display.update(myrect)
incx = 1
incy = 1
while True:
    pygame.time.wait(fps)
    positions = (myrect.topleft,
                 myrect.topright,
                 myrect.bottomright,
                 myrect.bottomleft)
    if positions[0][0] < 0 or positions[3][0] < 0:
        incx = 1
    if positions[0][1] < 0 or positions[1][1] < 0:
        incy = 1
    if positions[2][0] > 400 or positions[1][0] > 400:
        incx = -1
    if positions[3][1] > 400 or positions[2][1] > 400:
        incy = -1
    # positions[0][0] += incx
    # positions[1][0] += incx
    # positions[2][0] += incx
    # positions[3][0] += incx
    # positions[0][1] += incy
    # positions[1][1] += incy
    # positions[2][1] += incy
    # positions[3][1] += incy
    oldrect = myrect
    myrect = myrect.move((incx, incy))
    screen.fill((0, 255, 255))
    # myrect = pygame.draw.polygon(screen, (255, 0, 0), positions)
    screen.fill((255, 0, 0), myrect)
    pygame.display.update((oldrect, myrect))
