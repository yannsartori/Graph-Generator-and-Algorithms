# Graph-Generator-and-Algorithms
Create a graph on which algorithms can be invoked. Created with JavaScript and Canvas
See it in action at https://www.cs.mcgill.ca/~ysarto/projectsDir/graph
## Goals
As I learnt in my previous project, using CSS to control the view component of the MVC paradigm is quite tricky. Due to this, I decided with great enthusiasm to learn and use the `canvas` element of HTML5. I was inspired because as I learnt in my algorithms and data structures class, it is quite difficult to create graphs with painting utilities, LaTeX, or even other graph creators. Additionally, I would have to frequently find websites that executed these algorithms to check my work. As such, it is easier to find if they are all in the same place. The goals for this project were as follows: 
- more complex user interaction (mouse events, key combinations)
- utililzing the `canvas` element and subsequently gaining of familarity of it. 
- stricter adherence to the MVC paradigm
- I had to break out the pen and paper to figure out the geometry and the linear algebra behind drawing the edges (primarily with arrow heads and looped edges)
- implementing what I learnt in my algorithms and data structures class
## On what can be improved
I'm actually quite satisfied with this project. However, as with any project, improvements can certainly be made.
- doing a check when adding a new edge to ensure that if nodes are assigned as a source or sink, that they still can be (i.e. source has no in-neighbours, sink has no out-neighbours)
- adding more algorithms. ~~As of present, the only I have planned is a max-flow min-cut algorithm (Edmonds-Karp).~~(*implemented*) The algorithm itself, as were for the others, wouldn't be difficult to implement. The challenge comes in manipulating the view to present the results
- improving the arrow head appearance on looped edges
- ~~when creating an edge, once `u` is selected, draw an edge from `u` to the mouse pointer on animation frame. This would allow for more clarity and feedback to which vertex is selected in edge creation~~ (*implemented*)
