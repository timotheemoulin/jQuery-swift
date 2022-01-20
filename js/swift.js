/**
 * Swift Parallax
 * @author: Timothee Moulin
 * @website: https://github.com/timotheemoulin/jQuery-swift
 *
 * This plugin allows you to simply make parallax effect on DOM elements and backgrounds.
 *
 * Backgrounds can be fixed or scrolled (default)
 *  background-attachment: fixed;
 *  background-attachment: scroll;
 *
 * DOM elements must be relatives
 *  position: relative;
 *
 * Examples :
 * $('#header_move_1').swift({'type': 'dom', 'positionStart': 'top', 'length': '200'});
 * $('#slide_header').swift({'type': 'bg', 'positionStart': '-200', 'length': '200'});
 * $('.features_titles').swift({'type': 'dom', 'axis': 'left', 'positionStart': 'left', 'positionEnd': '50', 'length': '100', 'delay': '50', 'links': 'after'});
 * $('.features_titles').swift({'type': 'dom', 'axis': 'left', 'positionStart': '50', 'positionEnd': '-25', 'length': '50', 'delay': '150', 'links': 'both'});
 * $('.features_titles').swift({'type': 'dom', 'axis': 'left', 'positionStart': '-25', 'length': '50', 'delay': '200', 'links': 'before'});
 *
 * Parameters :
 * jQuery selector : can refer to a single element or a collection
 * type : dom | bg : add a transition to the background or the element itself
 * axis : top (default) | left : move the element vertically or horizontally
 * positionStart : left | right | top | bottom | {integer value} : position before the animation
 * positionEnd : {integer value} : position after the animation
 * length : {integer value} : length of the animation
 * delay : auto | {integer value} : delay before the animation starts
 * '%' : 100vh
 * '%%' : 200vh
 * links : undefined (default) | after | both | before : if you want to set more than one animation on the same element, you must add this parameter; says if there is another animation "after", "before", or "both before and after" this one
 */

(function ($) {

    // contain the list of all the elements we must move
    let swiftListDOM = [];
    let swiftListBg = [];
    let timeout = null;

    /**
     * Add a new Swift Rule
     */
    $.fn.swift = function (options) {

        // disabled on mobiles
        if (swiftAllowedOnMobile()) {

            return this.each(function () {

                let settings = $.extend({
                    // These are the defaults.
                    type: "dom",
                    duration: "%",
                    positionEnd: "0",
                    opacityStart: "1",
                    opacityEnd: "1",
                    delay: "auto",
                    axis: 'top',
                    links: undefined,
                }, options);

                if (undefined === settings.initial) {
                    settings.initial = $(this).css(settings.axis);
                }

                let usePercent = ((settings.positionEnd + '').match(/\%$/) !== null);

                settings.initial = swiftGetInitialPosition($(this), settings.initial) + 'px';

                let calculatedDelay = swiftGetDelay($(this), settings.axis, settings.delay);

                if (settings.duration === '%') {
                    // make it run during one screen height, but max during what's left of the screen
                    settings.duration = Math.min(screen.availHeight, ($(document).height() - $(this).offset().top));
                } else if (settings.duration === '%%') {
                    settings.duration = Math.min(2 * screen.availHeight, ($(document).height() - $(this).offset().top));
                } else if (settings.duration.match(/vh$/)) {
                    settings.duration = settings.duration.match(/(\d+)vh$/)[1] / 100 * screen.availHeight;
                }

                let calculatedLength = (parseFloat(calculatedDelay) + parseFloat(settings.duration) > $(document).height()) ? $(document).height() - calculatedDelay : parseFloat(settings.duration);
                let positionStart = swiftGetInitialPosition($(this), settings.positionStart);
                settings.positionEnd = swiftGetInitialPosition($(this), settings.positionEnd);

                let uniqueSelector = 'sid_' + swiftRand();

                $(this).addClass(uniqueSelector);

                let rule = {
                    'selector': '.' + uniqueSelector,
                    'axis': settings.axis,
                    'initial': settings.initial,
                    'positionStart': parseFloat(positionStart),
                    'positionEnd': parseFloat(settings.positionEnd),
                    'opacityStart': parseFloat(settings.opacityStart),
                    'opacityEnd': parseFloat(settings.opacityEnd),
                    'speed': parseFloat(parseFloat(settings.positionEnd - positionStart) / calculatedLength),
                    'delay': parseFloat(calculatedDelay),
                    'end': parseFloat(calculatedDelay + calculatedLength),
                    'links': settings.links,
                    'usePercent': usePercent,
                };

                if (settings.pseudo !== undefined) {
                    rule.pseudo = settings.pseudo;
                }

                // console.log(settings);
                if (settings.type === 'dom') {
                    swiftListDOM.push(rule);

                    if (['fixed', 'relative'].indexOf($(this).css('position')) === -1) {
                        $(this).css('position', 'relative');
                    }
                } else if (settings.type === 'bg') {
                    swiftListBg.push(rule);
                }

                $(this).addClass('swift ' + settings.type);

                swiftInit();
            });
        }
    };

    function swiftInit() {

        swiftScroll();

        swiftDOM();
        swiftBackground();
    }

    function swiftScroll() {

        $(window).scroll(function () {
            if (timeout === null) {
                // console.log('scroll', swiftCurrentScroll());
                swiftDOM();
                swiftBackground();

                timeout = setTimeout(function () {
                    timeout = null;
                }, 25);
            }
        });
    }

    function swiftRand() {
        return Math.random().toString(36).substr(2);
    }

    function swiftAllowedOnMobile() {

        return !('ontouchstart' in document.documentElement);
    }

    /**
     * Get the <style> element related to the current pseudo rule.
     */
    function getPseudoStyleTag(rule) {

        let style = $(rule.selector).find('.style-' + rule.pseudo);
        if (style.length === 0) {
            style = $('<style class="style-' + rule.pseudo + '"></style>');
            $(rule.selector).append(style);
        }

        return style;
    }

    /**
     * Run Swift DOM Elements
     */
    function swiftDOM() {

        // For each DOM elements rule
        $.each(swiftListDOM, function (key, rule) {
            if (swiftMustMove(rule)) {
                // console.log(rule.selector, rule.axis, swiftCalculatePosition(rule));
                if (rule.pseudo) {
                    let style = getPseudoStyleTag(rule);

                    let pseudoRule = rule.selector + ':' + rule.pseudo;
                    let fullRule = rule.axis + ': ' + swiftCalculatePosition(rule) + ';';
                    fullRule += 'opacity: ' + swiftCalculateOpacity(rule) + ';';

                    style.html(pseudoRule + '{ ' + fullRule + ' }')
                } else {
                    $(rule.selector).css(rule.axis, swiftCalculatePosition(rule));
                    $(rule.selector).css('opacity', swiftCalculateOpacity(rule));
                }
            }
        });
    }

    /**
     * Run Swift Backgrounds
     */
    function swiftBackground() {

        // For each Background elements rule
        $.each(swiftListBg, function (key, rule) {
            if (swiftMustMove(rule)) {
                if (rule.pseudo) {
                    // special treatment for pseudo elements (before, after)
                    let style = $(rule.selector).find('.style-' + rule.pseudo);
                    if (style.length === 0) {
                        style = $('<style class="style-' + rule.pseudo + '"></style>');
                        $(rule.selector).append(style);
                    }
                    let pseudoRule = rule.selector + ':' + rule.pseudo;
                    if (rule.axis === 'top') {
                        style.html(pseudoRule + '{ background-position-y: ' + swiftCalculatePosition(rule) + '; }');
                    } else if (rule.axis === 'left') {
                        let y = $(rule.selector).css('background-position-y');
                        style.html(pseudoRule + '{ background-position: left ' + swiftCalculatePosition(rule) + " " + y + '; }');
                    } else if (rule.axis === 'right') {
                        let y = $(rule.selector).css('background-position-y');
                        style.html(pseudoRule + '{ background-position: right ' + swiftCalculatePosition(rule) + " top " + y + '; }');
                    }
                } else {
                    // default behavior for DOM element manipulation
                    if (rule.axis === 'top') {
                        $(rule.selector).css('background-position-y', swiftCalculatePosition(rule));
                    } else if (rule.axis === 'left') {
                        let y = $(rule.selector).css('background-position-y');
                        $(rule.selector).css('background-position', "left " + swiftCalculatePosition(rule) + " " + y);
                    } else if (rule.axis === 'right') {
                        let y = $(rule.selector).css('background-position-y');
                        $(rule.selector).css('background-position', "right " + swiftCalculatePosition(rule) + " top " + y);
                    }
                }
            }
        });
    }

    /**
     * Defines if the element must move
     */
    function swiftMustMove(rule) {

        let move = false;
        let current = swiftCurrentScroll();
        let deltaScrolled = current - rule.delay;

        if (deltaScrolled > 0 && current < rule.end && current > rule.delay) {
            move = true;
        } else if (deltaScrolled <= 0 && (rule.links === 'after' || rule.links === undefined)) {
            move = true;
        } else if (current >= rule.end && (rule.links === 'before' || rule.links === undefined)) {
            move = true;
        }

        return move;
    }

    /**
     * Return the new opacity.
     */
    function swiftCalculateOpacity(rule) {

        let opacity = 1;
        let current = swiftCurrentScroll();
        let deltaScrolled = current - rule.delay;

        if (deltaScrolled > 0) {
            let diff = rule.opacityEnd - rule.opacityStart;
            let percentage = deltaScrolled / (rule.end - rule.delay);
            opacity = rule.opacityStart + (diff * percentage);
            // console.log(diff, percentage, opacity);
        }
        return opacity;
    }

    /**
     * Return the new position for the given object and axis
     */
    function swiftCalculatePosition(rule) {

        let position = 0;
        let current = swiftCurrentScroll();
        let deltaScrolled = current - rule.delay;
        let unit = rule.usePercent ? '%' : 'px';
        if (deltaScrolled > 0 && (current < rule.end)) {
            position = "calc(" + (rule.speed * deltaScrolled + rule.positionStart) + unit + " + " + rule.initial + ")";
        } else if (deltaScrolled <= 0) {
            position = "calc(" + (rule.positionStart) + unit + " + " + rule.initial + ")";
        } else if (current >= rule.end) {
            position = "calc(" + (rule.speed * (rule.end - rule.delay) + rule.positionStart) + unit + " + " + rule.initial + ")";
        }
        return position;
    }

    /**
     * Return the current scroll position
     */
    function swiftCurrentScroll() {

        return parseFloat($(window).scrollTop());
    }

    /**
     * Return the initial position
     */
    function swiftGetInitialPosition(element, position) {

        if (position === undefined) {
            position = 0;
        }

        if (isNaN(position)) {
            if (position === 'bottom') {
                let windowHeight = $(window).height();
                let documentHeight = $(document).height();

                if (element.offset().top + windowHeight > documentHeight) {
                    position = documentHeight - element.offset().top - element.height() - 10;
                } else {
                    position = windowHeight;
                }
            } else if (position === 'top') {
                position = 0 - element.offset().top - element.height();
            } else if (position === 'right') {
                position = $(document).width();
            } else if (position === 'left') {
                position = 0 - element.offset().left - element.width();
            } else if (position.includes('vh')) {
                position = $(document).height() * (position.substr(0, position.length - 2)) / 100;
            } else if (position.includes('vw')) {
                position = $(document).width() * (position.substr(0, position.length - 2)) / 100;
            } else if (position === 'auto') {
                position = 0;
            }
        }

        return parseFloat(position);
    }

    /**
     * Return the delay (scroll before swifting) for the given element and axis
     */
    function swiftGetDelay(element, axis, delay) {

        if (delay === undefined) {
            delay = 0;
        }

        if (isNaN(delay)) {

            if (delay === 'auto') {
                delay = element.offset().top - $(window).height();
            }
        }

        if (delay < 0) {
            delay = 0;
        }

        return parseFloat(delay);
    }

}(jQuery));
