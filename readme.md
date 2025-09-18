Ok so I made a method for doing mental arithmetic visually. You use a grid of factors. To do multiplication you slide around adding vectors.

It deserves a proper explanation, but you won't find that there. It's a very deep (but amazing) rabbit hole when you get into the details.

I mostly use it to help me with basic things that I should already know. It makes these things faster, or at least just gives me some nice intuition for why they make sense. Other things become much more tricky and I lying awake at night feeling like I'm into the final round of maths challenge trying to work out 7 \* 8. Either way it's pretty fun.

[The tool](http://gla23.github.io/factor-grid) displays the grid for use with various things:

- Exploring what happens when you get into factors at the edge of the ~grid~ known world
- Locating good replacements for primes higher than 5 and their multiples
- Using different factors for each axis (bad idea)
- Displaying the number in bases other than 10 (bad idea)
- Finding "error fractions" of multiplier approximations (how to working with numbers whose factors don't just consist of 2, 3 or 5s)
- Creating pages that can be shared due to the data in URL params. I use these to add iframes into my Anki decks e.g. [bits and bytes](https://gla23.github.io/factor-grid/?visible=0.0_0.4_0.8_0.10_0.3_1.3_0.5&xP=10&xN=1&yP=2&yN=1&blind=true&just-grid=true). You can display specific numbers you want to show off, or mask numbers you want to be quizzed on.

<br>

```
<iframe src="https://gla23.github.io/factor-grid/?visible=0.0_0.4_0.8_0.10_0.3_1.3_0.5&xP=10&xN=1&yP=2&yN=1&blind=true&just-grid=true" height="400px" width="800px"></iframe>
```
