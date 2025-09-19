Ok so I made a method for doing mental arithmetic visually. You take a graph and give each axis a factor. Then to multiply you slide around adding vectors.

It deserves a proper explanation at some point. The fun comes when trying to work with numbers whose factors don't just consist of 2, 3 or 5s.

5s? Yes, go left!

I mostly use it to help me with basic things that I should already know. It makes these things faster, or at least just gives me some nice intuition for why they make sense. Other things become much more tricky and I lying awake at night feeling like I'm into the final round of maths challenge trying to work out 7 \* 8. Either way it's pretty fun.

[The tool](http://gla23.github.io/factor-axes) can be used for various things.

- The basic graph explans the concept. It has sliders to change the axes lenghts so you can explore what happens when you go off the edge of the ~grid~ known world.
- The coloured lines help orient yourself mentally when using the graph without seeing it in front of you physically. They also aid memorisation of the grid.
- You can use the tool to find good replacements for primes higher than 5 and their multiples. Click on a number to add an approximation which will then fill the boxes in the bottom right to show your coverage of 1-100. The "error fractions" of these multiplier approximations are also displayed.
- You can give the axes factors other than 2 and 3 (bad idea)
- You can display the numbers in bases other than 10 (bad idea)
- You can fiddle with the settings to create shareable pages due to the data being in URL params. I use these to add iframes into my Anki decks e.g. [bits and bytes](https://gla23.github.io/factor-axes/?visible=0.0_0.4_0.8_0.10_0.3_1.3_0.5&xP=10&xN=1&yP=2&yN=1&blind=true&just-grid=true). You can pick specific numbers you want to show, or mask numbers you want to be quizzed on.

<br>

```
<iframe src="https://gla23.github.io/factor-axes/?visible=0.0_0.4_0.8_0.10_0.3_1.3_0.5&xP=10&xN=1&yP=2&yN=1&blind=true&just-grid=true" height="400px" width="800px"></iframe>
```

Other stuff:

- Squaring and Surds are fun - perhaps very intuitive for children?
- Each number has a line - it's more like contours.
- Using major system to aid memory. This is exponentially efficient over "multiplication tables"
- Alternate universe where 7 is in the center (I should add an input for the center number)
- Methods of adding e.g. holding two numbers them combining them when matching patterns e.g. a box + west = north-west. (2 + 1 = 3, or that pattern slid around onto any other set of numbers).

To do:

- The default values in that hook should be centralised not kept in sync in the args
- Stop it being so stretched horizontally when printing
