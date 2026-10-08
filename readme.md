Ok so I made a method for doing mental arithmetic visually. You take a graph and give each axis a factor. Then to multiply you slide around adding vectors.

Play around [here](http://gla23.github.io/factor-axes).

It deserves a proper explanation at some point. The fun comes when trying to work with numbers whose factors don't just consist of 2, 3 or 5s.

5s? Yes, go left!

I mostly use it to help me with basic things that I should already know. It makes these things faster, or at least just gives me some nice intuition for why they make sense. Other things become much more tricky and I lying awake at night feeling like I'm into the final round of maths challenge trying to work out 7 \* 8. Either way it's pretty fun.

[The tool](http://gla23.github.io/factor-axes) can be used for various things.

- The basic graph illustrates the concept. It has sliders to change the axes lenghts so you can explore what happens when you go off the edge of the ~grid~ known world.
- The coloured lines help orient yourself mentally when using the graph without seeing it in front of you physically. They also aid memorisation of the grid.
- You can use the tool to find good replacements for primes higher than 5 and their multiples. Click on a number to add an approximation which will then fill the boxes in the bottom right to show your coverage of 1-100. The "error fractions" of these multiplier approximations are also displayed.
- You can give the axes factors other than 2 and 3 (bad idea)
- You can display the numbers in bases other than 10 (bad idea)
- You can fiddle with the settings to create shareable pages due to the data being in URL params. I use these to add iframes into my Anki decks e.g. [bits and bytes](https://gla23.github.io/factor-axes/?show=1_8_16_24_32_256_1024&xP=10&xN=1&yP=2&yN=1&blind=true&just-grid=true). Pick the numbers to reveal with `show` and the ones to mask with `hide`, written as integers or fractions like `9/2`. Hide wins if a number is in both, and clicking moves numbers between the lists. Old links using the coordinate-based `visible` and `masked` params are converted automatically.
- Example: [Show powers of two](https://gla23.github.io/factor-axes/?show=1_2_4_8_16_32_64_128_256&xP=8&xN=1&yP=2&yN=1&blind=true&just-grid=true)
- Example: [Center 7 and hide one step](https://gla23.github.io/factor-axes/?centralNumber=7&show=7_14_21_28_42&hide=28&xP=3&xN=1&yP=2&yN=1&blind=true&just-grid=true)

<br>

```
<iframe src="https://gla23.github.io/factor-axes/?show=1_8_16_24_32_256_1024&xP=10&xN=1&yP=2&yN=1&blind=true&just-grid=true" height="400px" width="800px"></iframe>
```

Other stuff:

- Squaring and Surds are fun - perhaps quite intuitive for children?
- Each number has a line - it's more like contours than points.
- Using major system to aid memory. This is exponentially efficient over memorising "multiplication tables"
- Explore methods of adding e.g. holding two numbers them combining them when matching patterns e.g. a box + west = north-west. (2 + 1 = 3, or that pattern slid around onto any other set of numbers).
- See todo.md
