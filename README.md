Copyright 2014-2021 Swift - Timothee Moulin  
https://timothee-moulin.me/

---
Swift is a jQuery Plugin that allows you to easily add parallax effects on your backgrounds.  
You can also add transitions on your DOM elements to make them appear from the side of the screen while the user scroll down.
It even allows to interact with pseudo elements (:before, :after).

---
INSTALLATION
---
1. Get the sources (JS / CSS)
2. Add it to your HTML
    + ```<script src="js/swift.js"></script>```
3. Add your effects
	+ ```$('#header_move_1').swift({'type': 'dom', 'positionStart': 'top', 'length': '200'});```
	+ ```$('#slide_header').swift({'type': 'bg', 'positionStart': '-200', 'length': '200'});```
	+ ```$('.features_titles').swift({'type': 'dom', 'axis': 'left', 'positionStart': 'left', 'positionEnd': '50', 'length': '100', 'delay': '50', 'links': 'after'});```
    + ```$('.features_titles').swift({'type': 'dom', 'axis': 'left', 'positionStart': '50', 'positionEnd': '-25', 'length': '50', 'delay': '150', 'links': 'both'});  ```
    + ```$('.features_titles').swift({'type': 'dom', 'axis': 'left', 'positionStart': '-25', 'length': '50', 'delay': '200', 'links': 'before'});```
    

PARAMETERS
---
- jQuery selector : can refer to a single element or a collection
- type : dom | bg : add a transition to the background or the element itself
- axis : top (default) | left : move the element vertically or horizontally
- positionStart : left | right | top | bottom | {integer value} : position before the animation
- positionEnd : {integer value} : position after the animation
- length : {integer value} : length of the animation
- delay : auto | {integer value} : delay before the animation starts
  - '%' : 100vh
  - '%%' : 200vh
- links : undefined (default) | after | both | before : if you want to set more than one animation on the same element, you must add this parameter; says if there is another animation "after", "before", or "both before and after" this one
