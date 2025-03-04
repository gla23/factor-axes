Ok so I made up a method for doing mental arithmetic visually. You use a grid of factors. To do multiplication you slide around adding vectors.

One day I'll explain it properly here, but I doubt I will schedule it for some time because it becomes a crazy (but amazing) rabbit hole when you get into the details.

I mostly use it to help me with basic things that I should already know. It makes these things faster, or at least just gives me some nice intuition for why they make sense. Other things become much more tricky and I lying awake at night feeling like I'm into the final round of maths challenge trying to work out 7 \* 8. Either way it's pretty fun.

[The tool](http://gla23.github.io/factor-grid) displays the grid for use with various things:

- Exploring what happens when you get into factors at the edge of the ~grid~ known world
- Locating good replacements for primes higher than 5 and their multiples
- Using different factors for each axis (bad idea)
- Finding "error fractions" of multiplier approximations for working with numbers whose factors don't just consist of 2, 3 or 5s
- Using the URL params to add visuals into my Anki decks via an iframe e.g. [bytes](https://gla23.github.io/factor-grid/?simple&grid&blind&axes=8,2,4,3&showing=3,0+4,0+5,0+3,1)

| Query param example | Effect                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `simple`            | Remove the controls and coverage display                                                           |
| `blind`             | Don't display the grid numbers                                                                     |
| `grid`              | Display the grid lines by default                                                                  |
| `axes=11,6,5`       | Provide a default to the axis lengths                                                              |
| `hidden=2,2+-1,3`   | Display "???" over the numbers at the given co-ordinates. This is for practising using the system. |
| `showing=2,2+-1,3`  | Show the numbers at the given co-ordinates by deafult (clicking toggles them)                      |

<br>

```
<iframe src="https://gla23.github.io/factor-grid/?simple&amp;grid&amp;blind&amp;axes=8,1,4,3&amp;showing=3,0+4,0+5,0+3,1" height="400px" width="800px"></iframe>
```
