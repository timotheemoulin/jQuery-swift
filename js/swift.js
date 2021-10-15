/**
 * Swift Parallax
 * @author: Timothee Moulin
 * @website: timothee-moulin.me
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
 * Examples and documentation are availables on swift.timothee-moulin.me
 */

(function ($) {

    // contain the list of all the elements we must move
    var swiftListDOM = [];
    var swiftListBg = [];

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
                    delay: "auto",
                    axis: 'top',
                    links: undefined,
                }, options);

                if (undefined === settings.initial) {
                    settings.initial = $(this).css(settings.axis);
                }

                let calculatedDelay = swiftGetDelay($(this), settings.axis, settings.delay);

                if (settings.duration === '%') {
                    // make it run during one screen height, but max during what's left of the screen
                    settings.duration = Math.min(screen.availHeight, ($(document).height() - $(this).offset().top));
                } else if (settings.duration === '%%') {
                    settings.duration = Math.min(2 * screen.availHeight, ($(document).height() - $(this).offset().top));
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
                    'speed': parseFloat(parseFloat(settings.positionEnd - positionStart) / calculatedLength),
                    'delay': parseFloat(calculatedDelay),
                    'end': parseFloat(calculatedDelay + calculatedLength),
                    'links': settings.links,
                };
                // console.log(rule);
                if (settings.type === 'dom') {
                    swiftListDOM.push(rule);
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

        $(window).scroll(function (e) {

            swiftDOM();
            swiftBackground();
        });
    }


    function swiftRand() {
        return Math.random().toString(36).substr(2);
    }

    function swiftAllowedOnMobile() {

        return !('ontouchstart' in document.documentElement);
    }


    /**
     * Run Swift DOM Elements
     */
    function swiftDOM() {

        // For each DOM elements rule
        $.each(swiftListDOM, function (key, rule) {

            if (swiftMustMove(rule)) {
                $(rule.selector).css(rule.axis, swiftCalculatePosition(rule));
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
                if (rule.axis === 'top') {
                    $(rule.selector).css('background-position-y', swiftCalculatePosition(rule));
                } else if (rule.axis === 'left') {
                    let y = $(rule.selector).css('background-position-y');
                    $(rule.selector).css('background-position', "left " + swiftCalculatePosition(rule) + " " + y);
                } else if (rule.axis === 'right') {
                    let y = $(rule.selector).css('background-position-y');
                    $(rule.selector).css('background-position', "right " + swiftCalculatePosition(rule) + " top " + y);
                    // console.log('background-position', "right " + swiftCalculatePosition(rule) + " top " + y);
                }
            }
        });

    }


    /**
     * Defines if the element must move
     */
    function swiftMustMove(rule) {

        var move = false;
        var current = swiftCurrentScroll();
        var deltaScrolled = current - rule.delay;

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
     * Return the new position for the given object and axis
     */
    function swiftCalculatePosition(rule) {

        let position = 0;
        let current = swiftCurrentScroll();
        let deltaScrolled = current - rule.delay;

        if (deltaScrolled > 0 && current < rule.end) {
            position = "calc(" + (rule.speed * deltaScrolled + rule.positionStart) + "px + " + rule.initial + ")";
        } else if (deltaScrolled <= 0) {
            position = "calc(" + (rule.positionStart) + "px + " + rule.initial + ")";
        } else if (current >= rule.end) {
            position = "calc(" + (rule.speed * (rule.end - rule.delay) + rule.positionStart) + "px + " + rule.initial + ")";
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

                var windowHeight = $(window).height();
                var documentHeight = $(document).height();

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
