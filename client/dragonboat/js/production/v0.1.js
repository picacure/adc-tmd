(function (window) {
    var $out = "";
    $out += '<div class="mbox">\r\n    <div class="txt">龙舟比赛</div>\r\n    <div class="mID"><img src="./images/wait.gif" alt=""></div>\r\n    <div class="console"></div>\r\n    <div class="console"></div>\r\n    <div class="console"></div>\r\n</div>\r\n';

    window.TMPL = {};
    window.TMPL.mbody = $out;
})(window);

/* Zepto v1.0-1-ga3cab6c - polyfill zepto detect event ajax form fx - zeptojs.com/license */


;
(function (undefined) {
    if (String.prototype.trim === undefined) // fix for iOS 3.2
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '')
        }

    // For iOS 3.x
    // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
    if (Array.prototype.reduce === undefined)
        Array.prototype.reduce = function (fun) {
            if (this === void 0 || this === null) throw new TypeError()
            var t = Object(this), len = t.length >>> 0, k = 0, accumulator
            if (typeof fun != 'function') throw new TypeError()
            if (len == 0 && arguments.length == 1) throw new TypeError()

            if (arguments.length >= 2)
                accumulator = arguments[1]
            else
                do {
                    if (k in t) {
                        accumulator = t[k++]
                        break
                    }
                    if (++k >= len) throw new TypeError()
                } while (true)

            while (k < len) {
                if (k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
                k++
            }
            return accumulator
        }

})()

var Zepto = (function () {
    var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
        document = window.document,
        elementDisplay = {}, classCache = {},
        getComputedStyle = document.defaultView.getComputedStyle,
        cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rootNodeRE = /^(?:body|html)$/i,

    // special attributes that should be get/set via method calls
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow,
            '*': document.createElement('div')
        },
        readyRE = /complete|loaded|interactive/,
        classSelectorRE = /^\.([\w-]+)$/,
        idSelectorRE = /^#([\w-]*)$/,
        tagSelectorRE = /^[\w-]+$/,
        class2type = {},
        toString = class2type.toString,
        zepto = {},
        camelize, uniq,
        tempParent = document.createElement('div')

    zepto.matches = function (element, selector) {
        if (!element || element.nodeType !== 1) return false
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
            element.oMatchesSelector || element.matchesSelector
        if (matchesSelector) return matchesSelector.call(element, selector)
        // fall back to performing a selector:
        var match, parent = element.parentNode, temp = !parent
        if (temp) (parent = tempParent).appendChild(element)
        match = ~zepto.qsa(parent, selector).indexOf(element)
        temp && tempParent.removeChild(element)
        return match
    }

    function type(obj) {
        return obj == null ? String(obj) :
            class2type[toString.call(obj)] || "object"
    }

    function isFunction(value) {
        return type(value) == "function"
    }

    function isWindow(obj) {
        return obj != null && obj == obj.window
    }

    function isDocument(obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE
    }

    function isObject(obj) {
        return type(obj) == "object"
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && obj.__proto__ == Object.prototype
    }

    function isArray(value) {
        return value instanceof Array
    }

    function likeArray(obj) {
        return typeof obj.length == 'number'
    }

    function compact(array) {
        return filter.call(array, function (item) {
            return item != null
        })
    }

    function flatten(array) {
        return array.length > 0 ? $.fn.concat.apply([], array) : array
    }

    camelize = function (str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : ''
        })
    }
    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase()
    }

    uniq = function (array) {
        return filter.call(array, function (item, idx) {
            return array.indexOf(item) == idx
        })
    }

    function classRE(name) {
        return name in classCache ?
            classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
    }

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }

    function defaultDisplay(nodeName) {
        var element, display
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName)
            document.body.appendChild(element)
            display = getComputedStyle(element, '').getPropertyValue("display")
            element.parentNode.removeChild(element)
            display == "none" && (display = "block")
            elementDisplay[nodeName] = display
        }
        return elementDisplay[nodeName]
    }

    function children(element) {
        return 'children' in element ?
            slice.call(element.children) :
            $.map(element.childNodes, function (node) {
                if (node.nodeType == 1) return node
            })
    }

    // `$.zepto.fragment` takes a html string and an optional tag name
    // to generate DOM nodes nodes from the given html string.
    // The generated DOM nodes are returned as an array.
    // This function can be overriden in plugins for example to make
    // it compatible with browsers that don't support the DOM fully.
    zepto.fragment = function (html, name, properties) {
        if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
        if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
        if (!(name in containers)) name = '*'

        var nodes, dom, container = containers[name]
        container.innerHTML = '' + html
        dom = $.each(slice.call(container.childNodes), function () {
            container.removeChild(this)
        })
        if (isPlainObject(properties)) {
            nodes = $(dom)
            $.each(properties, function (key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value)
                else nodes.attr(key, value)
            })
        }
        return dom
    }

    // `$.zepto.Z` swaps out the prototype of the given `dom` array
    // of nodes with `$.fn` and thus supplying all the Zepto functions
    // to the array. Note that `__proto__` is not supported on Internet
    // Explorer. This method can be overriden in plugins.
    zepto.Z = function (dom, selector) {
        dom = dom || []
        dom.__proto__ = $.fn
        dom.selector = selector || ''
        return dom
    }

    // `$.zepto.isZ` should return `true` if the given object is a Zepto
    // collection. This method can be overriden in plugins.
    zepto.isZ = function (object) {
        return object instanceof zepto.Z
    }

    // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
    // takes a CSS selector and an optional context (and handles various
    // special cases).
    // This method can be overriden in plugins.
    zepto.init = function (selector, context) {
        // If nothing given, return an empty Zepto collection
        if (!selector) return zepto.Z()
        // If a function is given, call it when the DOM is ready
        else if (isFunction(selector)) return $(document).ready(selector)
        // If a Zepto collection is given, juts return it
        else if (zepto.isZ(selector)) return selector
        else {
            var dom
            // normalize array if an array of nodes is given
            if (isArray(selector)) dom = compact(selector)
            // Wrap DOM nodes. If a plain object is given, duplicate it.
            else if (isObject(selector))
                dom = [isPlainObject(selector) ? $.extend({}, selector) : selector], selector = null
            // If it's a html fragment, create nodes from it
            else if (fragmentRE.test(selector))
                dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) return $(context).find(selector)
            // And last but no least, if it's a CSS selector, use it to select nodes.
            else dom = zepto.qsa(document, selector)
            // create a new Zepto collection from the nodes found
            return zepto.Z(dom, selector)
        }
    }

    // `$` will be the base `Zepto` object. When calling this
    // function just call `$.zepto.init, which makes the implementation
    // details of selecting nodes and creating Zepto collections
    // patchable in plugins.
    $ = function (selector, context) {
        return zepto.init(selector, context)
    }

    function extend(target, source, deep) {
        for (key in source)
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                    target[key] = {}
                if (isArray(source[key]) && !isArray(target[key]))
                    target[key] = []
                extend(target[key], source[key], deep)
            }
            else if (source[key] !== undefined) target[key] = source[key]
    }

    // Copy all but undefined properties from one or more
    // objects to the `target` object.
    $.extend = function (target) {
        var deep, args = slice.call(arguments, 1)
        if (typeof target == 'boolean') {
            deep = target
            target = args.shift()
        }
        args.forEach(function (arg) {
            extend(target, arg, deep)
        })
        return target
    }

    // `$.zepto.qsa` is Zepto's CSS selector implementation which
    // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
    // This method can be overriden in plugins.
    zepto.qsa = function (element, selector) {
        var found
        return (isDocument(element) && idSelectorRE.test(selector)) ?
            ( (found = element.getElementById(RegExp.$1)) ? [found] : [] ) :
            (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
                slice.call(
                    classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
                        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
                            element.querySelectorAll(selector)
                )
    }

    function filtered(nodes, selector) {
        return selector === undefined ? $(nodes) : $(nodes).filter(selector)
    }

    $.contains = function (parent, node) {
        return parent !== node && parent.contains(node)
    }

    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg
    }

    function setAttribute(node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
    }

    // access className property while respecting SVGAnimatedString
    function className(node, value) {
        var klass = node.className,
            svg = klass && klass.baseVal !== undefined

        if (value === undefined) return svg ? klass.baseVal : klass
        svg ? (klass.baseVal = value) : (node.className = value)
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // JSON    => parse if valid
    // String  => self
    function deserializeValue(value) {
        var num
        try {
            return value ?
                value == "true" ||
                    ( value == "false" ? false :
                        value == "null" ? null :
                            !isNaN(num = Number(value)) ? num :
                                /^[\[\{]/.test(value) ? $.parseJSON(value) :
                                    value )
                : value
        } catch (e) {
            return value
        }
    }

    $.type = type
    $.isFunction = isFunction
    $.isWindow = isWindow
    $.isArray = isArray
    $.isPlainObject = isPlainObject

    $.isEmptyObject = function (obj) {
        var name
        for (name in obj) return false
        return true
    }

    $.inArray = function (elem, array, i) {
        return emptyArray.indexOf.call(array, elem, i)
    }

    $.camelCase = camelize
    $.trim = function (str) {
        return str.trim()
    }

    // plugin compatibility
    $.uuid = 0
    $.support = { }
    $.expr = { }

    $.map = function (elements, callback) {
        var value, values = [], i, key
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i)
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback(elements[key], key)
                if (value != null) values.push(value)
            }
        return flatten(values)
    }

    $.each = function (elements, callback) {
        var i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements
        }

        return elements
    }

    $.grep = function (elements, callback) {
        return filter.call(elements, callback)
    }

    if (window.JSON) $.parseJSON = JSON.parse

    // Populate the class2type map
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase()
    })

    // Define methods that will be available on all
    // Zepto collections
    $.fn = {
        // Because a collection acts like an array
        // copy over these useful array functions.
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,

        // `map` and `slice` in the jQuery API work differently
        // from their array counterparts
        map: function (fn) {
            return $($.map(this, function (el, i) {
                return fn.call(el, i, el)
            }))
        },
        slice: function () {
            return $(slice.apply(this, arguments))
        },

        ready: function (callback) {
            if (readyRE.test(document.readyState)) callback($)
            else document.addEventListener('DOMContentLoaded', function () {
                callback($)
            }, false)
            return this
        },
        get: function (idx) {
            return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
        },
        toArray: function () {
            return this.get()
        },
        size: function () {
            return this.length
        },
        remove: function () {
            return this.each(function () {
                if (this.parentNode != null)
                    this.parentNode.removeChild(this)
            })
        },
        each: function (callback) {
            emptyArray.every.call(this, function (el, idx) {
                return callback.call(el, idx, el) !== false
            })
            return this
        },
        filter: function (selector) {
            if (isFunction(selector)) return this.not(this.not(selector))
            return $(filter.call(this, function (element) {
                return zepto.matches(element, selector)
            }))
        },
        add: function (selector, context) {
            return $(uniq(this.concat($(selector, context))))
        },
        is: function (selector) {
            return this.length > 0 && zepto.matches(this[0], selector)
        },
        not: function (selector) {
            var nodes = []
            if (isFunction(selector) && selector.call !== undefined)
                this.each(function (idx) {
                    if (!selector.call(this, idx)) nodes.push(this)
                })
            else {
                var excludes = typeof selector == 'string' ? this.filter(selector) :
                    (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                this.forEach(function (el) {
                    if (excludes.indexOf(el) < 0) nodes.push(el)
                })
            }
            return $(nodes)
        },
        has: function (selector) {
            return this.filter(function () {
                return isObject(selector) ?
                    $.contains(this, selector) :
                    $(this).find(selector).size()
            })
        },
        eq: function (idx) {
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
        },
        first: function () {
            var el = this[0]
            return el && !isObject(el) ? el : $(el)
        },
        last: function () {
            var el = this[this.length - 1]
            return el && !isObject(el) ? el : $(el)
        },
        find: function (selector) {
            var result, $this = this
            if (typeof selector == 'object')
                result = $(selector).filter(function () {
                    var node = this
                    return emptyArray.some.call($this, function (parent) {
                        return $.contains(parent, node)
                    })
                })
            else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
            else result = this.map(function () {
                    return zepto.qsa(this, selector)
                })
            return result
        },
        closest: function (selector, context) {
            var node = this[0], collection = false
            if (typeof selector == 'object') collection = $(selector)
            while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
                node = node !== context && !isDocument(node) && node.parentNode
            return $(node)
        },
        parents: function (selector) {
            var ancestors = [], nodes = this
            while (nodes.length > 0)
                nodes = $.map(nodes, function (node) {
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node)
                        return node
                    }
                })
            return filtered(ancestors, selector)
        },
        parent: function (selector) {
            return filtered(uniq(this.pluck('parentNode')), selector)
        },
        children: function (selector) {
            return filtered(this.map(function () {
                return children(this)
            }), selector)
        },
        contents: function () {
            return this.map(function () {
                return slice.call(this.childNodes)
            })
        },
        siblings: function (selector) {
            return filtered(this.map(function (i, el) {
                return filter.call(children(el.parentNode), function (child) {
                    return child !== el
                })
            }), selector)
        },
        empty: function () {
            return this.each(function () {
                this.innerHTML = ''
            })
        },
        // `pluck` is borrowed from Prototype.js
        pluck: function (property) {
            return $.map(this, function (el) {
                return el[property]
            })
        },
        show: function () {
            return this.each(function () {
                this.style.display == "none" && (this.style.display = null)
                if (getComputedStyle(this, '').getPropertyValue("display") == "none")
                    this.style.display = defaultDisplay(this.nodeName)
            })
        },
        replaceWith: function (newContent) {
            return this.before(newContent).remove()
        },
        wrap: function (structure) {
            var func = isFunction(structure)
            if (this[0] && !func)
                var dom = $(structure).get(0),
                    clone = dom.parentNode || this.length > 1

            return this.each(function (index) {
                $(this).wrapAll(
                    func ? structure.call(this, index) :
                        clone ? dom.cloneNode(true) : dom
                )
            })
        },
        wrapAll: function (structure) {
            if (this[0]) {
                $(this[0]).before(structure = $(structure))
                var children
                // drill down to the inmost element
                while ((children = structure.children()).length) structure = children.first()
                $(structure).append(this)
            }
            return this
        },
        wrapInner: function (structure) {
            var func = isFunction(structure)
            return this.each(function (index) {
                var self = $(this), contents = self.contents(),
                    dom = func ? structure.call(this, index) : structure
                contents.length ? contents.wrapAll(dom) : self.append(dom)
            })
        },
        unwrap: function () {
            this.parent().each(function () {
                $(this).replaceWith($(this).children())
            })
            return this
        },
        clone: function () {
            return this.map(function () {
                return this.cloneNode(true)
            })
        },
        hide: function () {
            return this.css("display", "none")
        },
        toggle: function (setting) {
            return this.each(function () {
                var el = $(this)
                    ;
                (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
            })
        },
        prev: function (selector) {
            return $(this.pluck('previousElementSibling')).filter(selector || '*')
        },
        next: function (selector) {
            return $(this.pluck('nextElementSibling')).filter(selector || '*')
        },
        html: function (html) {
            return html === undefined ?
                (this.length > 0 ? this[0].innerHTML : null) :
                this.each(function (idx) {
                    var originHtml = this.innerHTML
                    $(this).empty().append(funcArg(this, html, idx, originHtml))
                })
        },
        text: function (text) {
            return text === undefined ?
                (this.length > 0 ? this[0].textContent : null) :
                this.each(function () {
                    this.textContent = text
                })
        },
        attr: function (name, value) {
            var result
            return (typeof name == 'string' && value === undefined) ?
                (this.length == 0 || this[0].nodeType !== 1 ? undefined :
                    (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
                        (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
                    ) :
                this.each(function (idx) {
                    if (this.nodeType !== 1) return
                    if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
                    else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
                })
        },
        removeAttr: function (name) {
            return this.each(function () {
                this.nodeType === 1 && setAttribute(this, name)
            })
        },
        prop: function (name, value) {
            return (value === undefined) ?
                (this[0] && this[0][name]) :
                this.each(function (idx) {
                    this[name] = funcArg(this, value, idx, this[name])
                })
        },
        data: function (name, value) {
            var data = this.attr('data-' + dasherize(name), value)
            return data !== null ? deserializeValue(data) : undefined
        },
        val: function (value) {
            return (value === undefined) ?
                (this[0] && (this[0].multiple ?
                    $(this[0]).find('option').filter(function (o) {
                        return this.selected
                    }).pluck('value') :
                    this[0].value)
                    ) :
                this.each(function (idx) {
                    this.value = funcArg(this, value, idx, this.value)
                })
        },
        offset: function (coordinates) {
            if (coordinates) return this.each(function (index) {
                var $this = $(this),
                    coords = funcArg(this, coordinates, index, $this.offset()),
                    parentOffset = $this.offsetParent().offset(),
                    props = {
                        top: coords.top - parentOffset.top,
                        left: coords.left - parentOffset.left
                    }

                if ($this.css('position') == 'static') props['position'] = 'relative'
                $this.css(props)
            })
            if (this.length == 0) return null
            var obj = this[0].getBoundingClientRect()
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            }
        },
        css: function (property, value) {
            if (arguments.length < 2 && typeof property == 'string')
                return this[0] && (this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

            var css = ''
            if (type(property) == 'string') {
                if (!value && value !== 0)
                    this.each(function () {
                        this.style.removeProperty(dasherize(property))
                    })
                else
                    css = dasherize(property) + ":" + maybeAddPx(property, value)
            } else {
                for (key in property)
                    if (!property[key] && property[key] !== 0)
                        this.each(function () {
                            this.style.removeProperty(dasherize(key))
                        })
                    else
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
            }

            return this.each(function () {
                this.style.cssText += ';' + css
            })
        },
        index: function (element) {
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
        },
        hasClass: function (name) {
            return emptyArray.some.call(this, function (el) {
                return this.test(className(el))
            }, classRE(name))
        },
        addClass: function (name) {
            return this.each(function (idx) {
                classList = []
                var cls = className(this), newName = funcArg(this, name, idx, cls)
                newName.split(/\s+/g).forEach(function (klass) {
                    if (!$(this).hasClass(klass)) classList.push(klass)
                }, this)
                classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
            })
        },
        removeClass: function (name) {
            return this.each(function (idx) {
                if (name === undefined) return className(this, '')
                classList = className(this)
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                    classList = classList.replace(classRE(klass), " ")
                })
                className(this, classList.trim())
            })
        },
        toggleClass: function (name, when) {
            return this.each(function (idx) {
                var $this = $(this), names = funcArg(this, name, idx, className(this))
                names.split(/\s+/g).forEach(function (klass) {
                    (when === undefined ? !$this.hasClass(klass) : when) ?
                        $this.addClass(klass) : $this.removeClass(klass)
                })
            })
        },
        scrollTop: function () {
            if (!this.length) return
            return ('scrollTop' in this[0]) ? this[0].scrollTop : this[0].scrollY
        },
        position: function () {
            if (!this.length) return

            var elem = this[0],
            // Get *real* offsetParent
                offsetParent = this.offsetParent(),
            // Get correct offsets
                offset = this.offset(),
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= parseFloat($(elem).css('margin-top')) || 0
            offset.left -= parseFloat($(elem).css('margin-left')) || 0

            // Add offsetParent borders
            parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
            parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            }
        },
        offsetParent: function () {
            return this.map(function () {
                var parent = this.offsetParent || document.body
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
                    parent = parent.offsetParent
                return parent
            })
        }
    }

    // for now
    $.fn.detach = $.fn.remove

        // Generate the `width` and `height` functions
    ;
    ['width', 'height'].forEach(function (dimension) {
        $.fn[dimension] = function (value) {
            var offset, el = this[0],
                Dimension = dimension.replace(/./, function (m) {
                    return m[0].toUpperCase()
                })
            if (value === undefined) return isWindow(el) ? el['inner' + Dimension] :
                isDocument(el) ? el.documentElement['offset' + Dimension] :
                    (offset = this.offset()) && offset[dimension]
            else return this.each(function (idx) {
                el = $(this)
                el.css(dimension, funcArg(this, value, idx, el[dimension]()))
            })
        }
    })

    function traverseNode(node, fun) {
        fun(node)
        for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
    }

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function (operator, operatorIndex) {
        var inside = operatorIndex % 2 //=> prepend, append

        $.fn[operator] = function () {
            // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
            var argType, nodes = $.map(arguments, function (arg) {
                    argType = type(arg)
                    return argType == "object" || argType == "array" || arg == null ?
                        arg : zepto.fragment(arg)
                }),
                parent, copyByClone = this.length > 1
            if (nodes.length < 1) return this

            return this.each(function (_, target) {
                parent = inside ? target : target.parentNode

                // convert all methods to a "before" operation
                target = operatorIndex == 0 ? target.nextSibling :
                    operatorIndex == 1 ? target.firstChild :
                        operatorIndex == 2 ? target :
                            null

                nodes.forEach(function (node) {
                    if (copyByClone) node = node.cloneNode(true)
                    else if (!parent) return $(node).remove()

                    traverseNode(parent.insertBefore(node, target), function (el) {
                        if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                            (!el.type || el.type === 'text/javascript') && !el.src)
                            window['eval'].call(window, el.innerHTML)
                    })
                })
            })
        }

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
            $(html)[operator](this)
            return this
        }
    })

    zepto.Z.prototype = $.fn

    // Export internal API functions in the `$.zepto` namespace
    zepto.uniq = uniq
    zepto.deserializeValue = deserializeValue
    $.zepto = zepto

    return $
})()

window.Zepto = Zepto
'$' in window || (window.$ = Zepto)

;
(function ($) {
    function detect(ua) {
        var os = this.os = {}, browser = this.browser = {},
            webkit = ua.match(/WebKit\/([\d.]+)/),
            android = ua.match(/(Android)\s+([\d.]+)/),
            ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
            iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
            webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
            touchpad = webos && ua.match(/TouchPad/),
            kindle = ua.match(/Kindle\/([\d.]+)/),
            silk = ua.match(/Silk\/([\d._]+)/),
            blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
            bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
            rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
            playbook = ua.match(/PlayBook/),
            chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
            firefox = ua.match(/Firefox\/([\d.]+)/)

        // Todo: clean this up with a better OS/browser seperation:
        // - discern (more) between multiple browsers on android
        // - decide if kindle fire in silk mode is android or not
        // - Firefox on Android doesn't specify the Android version
        // - possibly devide in os, device and browser hashes

        if (browser.webkit = !!webkit) browser.version = webkit[1]

        if (android) os.android = true, os.version = android[2]
        if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
        if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
        if (webos) os.webos = true, os.version = webos[2]
        if (touchpad) os.touchpad = true
        if (blackberry) os.blackberry = true, os.version = blackberry[2]
        if (bb10) os.bb10 = true, os.version = bb10[2]
        if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
        if (playbook) browser.playbook = true
        if (kindle) os.kindle = true, os.version = kindle[1]
        if (silk) browser.silk = true, browser.version = silk[1]
        if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
        if (chrome) browser.chrome = true, browser.version = chrome[1]
        if (firefox) browser.firefox = true, browser.version = firefox[1]

        os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) || (firefox && ua.match(/Tablet/)))
        os.phone = !!(!os.tablet && (android || iphone || webos || blackberry || bb10 ||
            (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) || (firefox && ua.match(/Mobile/))))
    }

    detect.call($, navigator.userAgent)
    // make available to unit tests
    $.__detect = detect

})(Zepto)

;
(function ($) {
    var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents = {},
        hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

    function zid(element) {
        return element._zid || (element._zid = _zid++)
    }

    function findHandlers(element, event, fn, selector) {
        event = parse(event)
        if (event.ns) var matcher = matcherFor(event.ns)
        return (handlers[zid(element)] || []).filter(function (handler) {
            return handler
                && (!event.e || handler.e == event.e)
                && (!event.ns || matcher.test(handler.ns))
                && (!fn || zid(handler.fn) === zid(fn))
                && (!selector || handler.sel == selector)
        })
    }

    function parse(event) {
        var parts = ('' + event).split('.')
        return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
    }

    function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
    }

    function eachEvent(events, fn, iterator) {
        if ($.type(events) != "string") $.each(events, iterator)
        else events.split(/\s/).forEach(function (type) {
            iterator(type, fn)
        })
    }

    function eventCapture(handler, captureSetting) {
        return handler.del &&
            (handler.e == 'focus' || handler.e == 'blur') || !!captureSetting
    }

    function realEvent(type) {
        return hover[type] || type
    }

    function add(element, events, fn, selector, getDelegate, capture) {
        var id = zid(element), set = (handlers[id] || (handlers[id] = []))
        eachEvent(events, fn, function (event, fn) {
            var handler = parse(event)
            handler.fn = fn
            handler.sel = selector
            // emulate mouseenter, mouseleave
            if (handler.e in hover) fn = function (e) {
                var related = e.relatedTarget
                if (!related || (related !== this && !$.contains(this, related)))
                    return handler.fn.apply(this, arguments)
            }
            handler.del = getDelegate && getDelegate(fn, event)
            var callback = handler.del || fn
            handler.proxy = function (e) {
                var result = callback.apply(element, [e].concat(e.data))
                if (result === false) e.preventDefault(), e.stopPropagation()
                return result
            }
            handler.i = set.length
            set.push(handler)
            element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
        })
    }

    function remove(element, events, fn, selector, capture) {
        var id = zid(element)
        eachEvent(events || '', fn, function (event, fn) {
            findHandlers(element, event, fn, selector).forEach(function (handler) {
                delete handlers[id][handler.i]
                element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
            })
        })
    }

    $.event = { add: add, remove: remove }

    $.proxy = function (fn, context) {
        if ($.isFunction(fn)) {
            var proxyFn = function () {
                return fn.apply(context, arguments)
            }
            proxyFn._zid = zid(fn)
            return proxyFn
        } else if (typeof context == 'string') {
            return $.proxy(fn[context], fn)
        } else {
            throw new TypeError("expected function")
        }
    }

    $.fn.bind = function (event, callback) {
        return this.each(function () {
            add(this, event, callback)
        })
    }
    $.fn.unbind = function (event, callback) {
        return this.each(function () {
            remove(this, event, callback)
        })
    }
    $.fn.one = function (event, callback) {
        return this.each(function (i, element) {
            add(this, event, callback, null, function (fn, type) {
                return function () {
                    var result = fn.apply(element, arguments)
                    remove(element, type, fn)
                    return result
                }
            })
        })
    }

    var returnTrue = function () {
            return true
        },
        returnFalse = function () {
            return false
        },
        ignoreProperties = /^([A-Z]|layer[XY]$)/,
        eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
        }

    function createProxy(event) {
        var key, proxy = { originalEvent: event }
        for (key in event)
            if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

        $.each(eventMethods, function (name, predicate) {
            proxy[name] = function () {
                this[predicate] = returnTrue
                return event[name].apply(event, arguments)
            }
            proxy[predicate] = returnFalse
        })
        return proxy
    }

    // emulates the 'defaultPrevented' property for browsers that have none
    function fix(event) {
        if (!('defaultPrevented' in event)) {
            event.defaultPrevented = false
            var prevent = event.preventDefault
            event.preventDefault = function () {
                this.defaultPrevented = true
                prevent.call(this)
            }
        }
    }

    $.fn.delegate = function (selector, event, callback) {
        return this.each(function (i, element) {
            add(element, event, callback, selector, function (fn) {
                return function (e) {
                    var evt, match = $(e.target).closest(selector, element).get(0)
                    if (match) {
                        evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
                        return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
                    }
                }
            })
        })
    }
    $.fn.undelegate = function (selector, event, callback) {
        return this.each(function () {
            remove(this, event, callback, selector)
        })
    }

    $.fn.live = function (event, callback) {
        $(document.body).delegate(this.selector, event, callback)
        return this
    }
    $.fn.die = function (event, callback) {
        $(document.body).undelegate(this.selector, event, callback)
        return this
    }

    $.fn.on = function (event, selector, callback) {
        return !selector || $.isFunction(selector) ?
            this.bind(event, selector || callback) : this.delegate(selector, event, callback)
    }
    $.fn.off = function (event, selector, callback) {
        return !selector || $.isFunction(selector) ?
            this.unbind(event, selector || callback) : this.undelegate(selector, event, callback)
    }

    $.fn.trigger = function (event, data) {
        if (typeof event == 'string' || $.isPlainObject(event)) event = $.Event(event)
        fix(event)
        event.data = data
        return this.each(function () {
            // items in the collection might not be DOM elements
            // (todo: possibly support events on plain old objects)
            if ('dispatchEvent' in this) this.dispatchEvent(event)
        })
    }

    // triggers event handlers on current element just as if an event occurred,
    // doesn't trigger an actual event, doesn't bubble
    $.fn.triggerHandler = function (event, data) {
        var e, result
        this.each(function (i, element) {
            e = createProxy(typeof event == 'string' ? $.Event(event) : event)
            e.data = data
            e.target = element
            $.each(findHandlers(element, event.type || event), function (i, handler) {
                result = handler.proxy(e)
                if (e.isImmediatePropagationStopped()) return false
            })
        })
        return result
    }

        // shortcut methods for `.bind(event, fn)` for each event type
    ;
    ('focusin focusout load resize scroll unload click dblclick ' +
        'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
        'change select keydown keypress keyup error').split(' ').forEach(function (event) {
            $.fn[event] = function (callback) {
                return callback ?
                    this.bind(event, callback) :
                    this.trigger(event)
            }
        })

    ;
    ['focus', 'blur'].forEach(function (name) {
        $.fn[name] = function (callback) {
            if (callback) this.bind(name, callback)
            else this.each(function () {
                try {
                    this[name]()
                }
                catch (e) {
                }
            })
            return this
        }
    })

    $.Event = function (type, props) {
        if (typeof type != 'string') props = type, type = props.type
        var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
        if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
        event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
        event.isDefaultPrevented = function () {
            return this.defaultPrevented
        }
        return event
    }

})(Zepto)

;
(function ($) {
    var jsonpID = 0,
        document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/

    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
        var event = $.Event(eventName)
        $(context).trigger(event, data)
        return !event.defaultPrevented
    }

    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

    // Number of active Ajax requests
    $.active = 0

    function ajaxStart(settings) {
        if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }

    function ajaxStop(settings) {
        if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false ||
            triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
            return false

        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }

    function ajaxSuccess(data, xhr, settings) {
        var context = settings.context, status = 'success'
        settings.success.call(context, data, status, xhr)
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
        ajaxComplete(status, xhr, settings)
    }

    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings) {
        var context = settings.context
        settings.error.call(context, xhr, type, error)
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
        ajaxComplete(type, xhr, settings)
    }

    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
        var context = settings.context
        settings.complete.call(context, xhr, status)
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
        ajaxStop(settings)
    }

    // Empty function, used as default callback
    function empty() {
    }

    $.ajaxJSONP = function (options) {
        if (!('type' in options)) return $.ajax(options)

        var callbackName = 'jsonp' + (++jsonpID),
            script = document.createElement('script'),
            cleanup = function () {
                clearTimeout(abortTimeout)
                $(script).remove()
                delete window[callbackName]
            },
            abort = function (type) {
                cleanup()
                // In case of manual abort or timeout, keep an empty function as callback
                // so that the SCRIPT tag that eventually loads won't result in an error.
                if (!type || type == 'timeout') window[callbackName] = empty
                ajaxError(null, type || 'abort', xhr, options)
            },
            xhr = { abort: abort }, abortTimeout

        if (ajaxBeforeSend(xhr, options) === false) {
            abort('abort')
            return false
        }

        window[callbackName] = function (data) {
            cleanup()
            ajaxSuccess(data, xhr, options)
        }

        script.onerror = function () {
            abort('error')
        }

        script.src = options.url.replace(/=\?/, '=' + callbackName)
        $('head').append(script)

        if (options.timeout > 0) abortTimeout = setTimeout(function () {
            abort('timeout')
        }, options.timeout)

        return xhr
    }

    $.ajaxSettings = {
        // Default type of request
        type: 'GET',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function () {
            return new window.XMLHttpRequest()
        },
        // MIME types mapping
        accepts: {
            script: 'text/javascript, application/javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0,
        // Whether data should be serialized to string
        processData: true,
        // Whether the browser should be allowed to cache GET responses
        cache: true,
    }

    function mimeToDataType(mime) {
        if (mime) mime = mime.split(';', 2)[0]
        return mime && ( mime == htmlType ? 'html' :
            mime == jsonType ? 'json' :
                scriptTypeRE.test(mime) ? 'script' :
                    xmlTypeRE.test(mime) && 'xml' ) || 'text'
    }

    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
        if (options.processData && options.data && $.type(options.data) != "string")
            options.data = $.param(options.data, options.traditional)
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
            options.url = appendQuery(options.url, options.data)
    }

    $.ajax = function (options) {
        var settings = $.extend({}, options || {})
        for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

        ajaxStart(settings)

        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
            RegExp.$2 != window.location.host

        if (!settings.url) settings.url = window.location.toString()
        serializeData(settings)
        if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

        var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
            return $.ajaxJSONP(settings)
        }

        var mime = settings.accepts[dataType],
            baseHeaders = { },
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = settings.xhr(), abortTimeout

        if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
        if (mime) {
            baseHeaders['Accept'] = mime
            if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
            xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
            baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
        settings.headers = $.extend(baseHeaders, settings.headers || {})

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty;
                clearTimeout(abortTimeout)
                var result, error = false
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
                    result = xhr.responseText

                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType == 'script')    (1, eval)(result)
                        else if (dataType == 'xml')  result = xhr.responseXML
                        else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
                    } catch (e) {
                        error = e
                    }

                    if (error) ajaxError(error, 'parsererror', xhr, settings)
                    else ajaxSuccess(result, xhr, settings)
                } else {
                    ajaxError(null, xhr.status ? 'error' : 'abort', xhr, settings)
                }
            }
        }

        var async = 'async' in settings ? settings.async : true
        xhr.open(settings.type, settings.url, async)

        for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort()
            return false
        }

        if (settings.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.onreadystatechange = empty
            xhr.abort()
            ajaxError(null, 'timeout', xhr, settings)
        }, settings.timeout)

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null)
        return xhr
    }

    // handle optional data/success arguments
    function parseArguments(url, data, success, dataType) {
        var hasData = !$.isFunction(data)
        return {
            url: url,
            data: hasData ? data : undefined,
            success: !hasData ? data : $.isFunction(success) ? success : undefined,
            dataType: hasData ? dataType || success : success
        }
    }

    $.get = function (url, data, success, dataType) {
        return $.ajax(parseArguments.apply(null, arguments))
    }

    $.post = function (url, data, success, dataType) {
        var options = parseArguments.apply(null, arguments)
        options.type = 'POST'
        return $.ajax(options)
    }

    $.getJSON = function (url, data, success) {
        var options = parseArguments.apply(null, arguments)
        options.dataType = 'json'
        return $.ajax(options)
    }

    $.fn.load = function (url, data, success) {
        if (!this.length) return this
        var self = this, parts = url.split(/\s/), selector,
            options = parseArguments(url, data, success),
            callback = options.success
        if (parts.length > 1) options.url = parts[0], selector = parts[1]
        options.success = function (response) {
            self.html(selector ?
                $('<div>').html(response.replace(rscript, "")).find(selector)
                : response)
            callback && callback.apply(self, arguments)
        }
        $.ajax(options)
        return this
    }

    var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope) {
        var type, array = $.isArray(obj)
        $.each(obj, function (key, value) {
            type = $.type(value)
            if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
            // handle data in serializeArray() format
            if (!scope && array) params.add(value.name, value.value)
            // recurse into nested objects
            else if (type == "array" || (!traditional && type == "object"))
                serialize(params, value, traditional, key)
            else params.add(key, value)
        })
    }

    $.param = function (obj, traditional) {
        var params = []
        params.add = function (k, v) {
            this.push(escape(k) + '=' + escape(v))
        }
        serialize(params, obj, traditional)
        return params.join('&').replace(/%20/g, '+')
    }
})(Zepto)

;
(function ($) {
    $.fn.serializeArray = function () {
        var result = [], el
        $(Array.prototype.slice.call(this.get(0).elements)).each(function () {
            el = $(this)
            var type = el.attr('type')
            if (this.nodeName.toLowerCase() != 'fieldset' && !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
                ((type != 'radio' && type != 'checkbox') || this.checked))
                result.push({
                    name: el.attr('name'),
                    value: el.val()
                })
        })
        return result
    }

    $.fn.serialize = function () {
        var result = []
        this.serializeArray().forEach(function (elm) {
            result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
        })
        return result.join('&')
    }

    $.fn.submit = function (callback) {
        if (callback) this.bind('submit', callback)
        else if (this.length) {
            var event = $.Event('submit')
            this.eq(0).trigger(event)
            if (!event.defaultPrevented) this.get(0).submit()
        }
        return this
    }

})(Zepto)

;
(function ($, undefined) {
    var prefix = '', eventPrefix, endEventName, endAnimationName,
        vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
        document = window.document, testEl = document.createElement('div'),
        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
        transform,
        transitionProperty, transitionDuration, transitionTiming,
        animationName, animationDuration, animationTiming,
        cssReset = {}

    function dasherize(str) {
        return downcase(str.replace(/([a-z])([A-Z])/, '$1-$2'))
    }

    function downcase(str) {
        return str.toLowerCase()
    }

    function normalizeEvent(name) {
        return eventPrefix ? eventPrefix + name : downcase(name)
    }

    $.each(vendors, function (vendor, event) {
        if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
            prefix = '-' + downcase(vendor) + '-'
            eventPrefix = event
            return false
        }
    })

    transform = prefix + 'transform'
    cssReset[transitionProperty = prefix + 'transition-property'] =
        cssReset[transitionDuration = prefix + 'transition-duration'] =
            cssReset[transitionTiming = prefix + 'transition-timing-function'] =
                cssReset[animationName = prefix + 'animation-name'] =
                    cssReset[animationDuration = prefix + 'animation-duration'] =
                        cssReset[animationTiming = prefix + 'animation-timing-function'] = ''

    $.fx = {
        off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
        speeds: { _default: 400, fast: 200, slow: 600 },
        cssPrefix: prefix,
        transitionEnd: normalizeEvent('TransitionEnd'),
        animationEnd: normalizeEvent('AnimationEnd')
    }

    $.fn.animate = function (properties, duration, ease, callback) {
        if ($.isPlainObject(duration))
            ease = duration.easing, callback = duration.complete, duration = duration.duration
        if (duration) duration = (typeof duration == 'number' ? duration :
            ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
        return this.anim(properties, duration, ease, callback)
    }

    $.fn.anim = function (properties, duration, ease, callback) {
        var key, cssValues = {}, cssProperties, transforms = '',
            that = this, wrappedCallback, endEvent = $.fx.transitionEnd

        if (duration === undefined) duration = 0.4
        if ($.fx.off) duration = 0

        if (typeof properties == 'string') {
            // keyframe animation
            cssValues[animationName] = properties
            cssValues[animationDuration] = duration + 's'
            cssValues[animationTiming] = (ease || 'linear')
            endEvent = $.fx.animationEnd
        } else {
            cssProperties = []
            // CSS transitions
            for (key in properties)
                if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
                else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

            if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
            if (duration > 0 && typeof properties === 'object') {
                cssValues[transitionProperty] = cssProperties.join(', ')
                cssValues[transitionDuration] = duration + 's'
                cssValues[transitionTiming] = (ease || 'linear')
            }
        }

        wrappedCallback = function (event) {
            if (typeof event !== 'undefined') {
                if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
                $(event.target).unbind(endEvent, wrappedCallback)
            }
            $(this).css(cssReset)
            callback && callback.call(this)
        }
        if (duration > 0) this.bind(endEvent, wrappedCallback)

        // trigger page reflow so new elements can animate
        this.size() && this.get(0).clientLeft

        this.css(cssValues)

        if (duration <= 0) setTimeout(function () {
            that.each(function () {
                wrappedCallback.call(this)
            })
        }, 0)

        return this
    }

    testEl = null
})(Zepto);

(function (window) {

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    //array remove
    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };

    //contains
    Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }
})(this);
/*
 *
 * Find more about this plugin by visiting
 * 3ks to http://alxgbsn.co.uk/
 *
 * Copyright (c) 2010-2012 Alex Gibson
 * Released under MIT license
 *
 */
(function (factory) {
    if (window['define'] == undefined) {
        var module = {},
            exports = module.exports = {}
            ;
        factory(null, exports, module);
        window['Shake'] = module.exports;
    } else {
        define(factory);
    }
})(function (require, exports, module) {

    function Shake() {

        //feature detect
        this.hasDeviceMotion = 'ondevicemotion' in window;

        //default velocity threshold for shake to register
        this.threshold = 15;

        //use date to prevent multiple shakes firing
        this.lastTime = new Date();

        //shake times.
        this.shakeTimes = 0;

        //accelerometer values
        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;

        //create custom event
        this.event = document.createEvent('Event');
        this.event.initEvent('shake', true, true);
    }

    //reset timer values
    Shake.prototype.reset = function () {

        this.lastTime = new Date();
        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;
    };

    //start listening for devicemotion
    Shake.prototype.start = function () {

        this.reset();
        if (this.hasDeviceMotion) {
            window.addEventListener('devicemotion', this, false);
        }
    };

    //stop listening for devicemotion
    Shake.prototype.stop = function () {

        if (this.hasDeviceMotion) {
            window.removeEventListener('devicemotion', this, false);
        }
        this.reset();
    };

    //calculates if shake did occur
    Shake.prototype.devicemotion = function (e) {

        var current = e.acceleration || e.accelerationIncludingGravity,
            currentTime,
            timeDifference,
            deltaX = 0,
            deltaY = 0,
            deltaZ = 0;

        if (e.acceleration) {
            this.threshold = 13;
        }
        else {
            if (e.accelerationIncludingGravity) {
                this.threshold = 15;
            }
        }

        if ((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)) {

            this.lastX = current.x;
            this.lastY = current.y;
            this.lastZ = current.z;
            return;
        }

        deltaX = Math.abs(this.lastX - current.x);
        deltaY = Math.abs(this.lastY - current.y);
        deltaZ = Math.abs(this.lastZ - current.z);

        if (((deltaX > this.threshold) && (deltaY > this.threshold)) || ((deltaX > this.threshold) && (deltaZ > this.threshold)) || ((deltaY > this.threshold) && (deltaZ > this.threshold))) {

            //calculate time in milliseconds since last shake registered
            currentTime = new Date();
            timeDifference = currentTime.getTime() - this.lastTime.getTime();

            this.shakeTimes++;

            if (timeDifference > 800 && this.shakeTimes > 5) {
                this.event.deltaX = current.x;
                this.event.deltaY = current.y;
                this.event.deltaZ = current.z;
                this.event.shakeTimes = this.shakeTimes;
                window.dispatchEvent(this.event);
                this.shakeTimes = 0;
                this.lastTime = new Date();
            }

//            this.event.deltaX = current.x;
//            this.event.deltaY = current.y;
//            this.event.deltaZ = current.z;
//            this.event.shakeTimes = this.shakeTimes;
//            window.dispatchEvent(this.event);
//            this.shakeTimes = 0;
//            this.lastTime = new Date();
        }
    };

    //event handler
    Shake.prototype.handleEvent = function (e) {

        if (typeof (this[e.type]) === 'function') {
            return this[e.type](e);
        }
    };

    module.exports = Shake;

});

/*!
 * EventEmitter v4.1.1 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function (exports) {
    // Place the script in strict mode

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class Manages event registering and emitting.
     */
    function EventEmitter() {
    }

    // Shortcuts to improve speed and size

    // Easy access to the prototype
    var proto = EventEmitter.prototype,
        nativeIndexOf = Array.prototype.indexOf ? true : false;

    /**
     * Finds the index of the listener for the event in it's storage array.
     *
     * @param {Function} listener Method to look for.
     * @param {Function[]} listeners Array of listeners to search through.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listener, listeners) {
        // Return the index via the native method if possible
        if (nativeIndexOf) {
            return listeners.indexOf(listener);
        }

        // There is no native method
        // Use a manual loop to find the index
        var i = listeners.length;
        while (i--) {
            // If the listener matches, return it's index
            if (listeners[i] === listener) {
                return i;
            }
        }

        // Default to returning -1
        return -1;
    }

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function () {
        return this._events || (this._events = {});
    };

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function (evt) {
        // Create a shortcut to the storage object
        // Initialise it if it does not exists yet
        var events = this._getEvents(),
            response,
            key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (typeof evt === 'object') {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function (evt) {
        var listeners = this.getListeners(evt),
            response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function (evt, listener) {
        var listeners = this.getListenersAsObject(evt),
            key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) &&
                indexOfListener(listener, listeners[key]) === -1) {
                listeners[key].push(listener);
            }
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = proto.addListener;

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function (evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function (evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function (evt, listener) {
        var listeners = this.getListenersAsObject(evt),
            index,
            key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listener, listeners[key]);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = proto.removeListener;

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function (evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function (evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function (remove, evt, listeners) {
        // Initialise any required variables
        var i,
            value,
            single = remove ? this.removeListener : this.addListener,
            multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of it's properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function (evt) {
        var type = typeof evt,
            events = this._getEvents(),
            key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (type === 'object') {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function (evt, args) {
        var listeners = this.getListenersAsObject(evt),
            i,
            key,
            response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    response = args ? listeners[key][i].apply(null, args) : listeners[key][i]();
                    if (response === true) {
                        this.removeListener(evt, listeners[key][i]);
                    }
                }
            }
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = proto.emitEvent;

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function (evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    // Expose the class either via AMD or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}(this));
/*! Socket.IO.js build:0.9.16, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */

var io = ('undefined' === typeof module ? {} : module.exports);
(function () {

    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, global) {

        /**
         * IO namespace.
         *
         * @namespace
         */

        var io = exports;

        /**
         * Socket.IO version
         *
         * @api public
         */

        io.version = '0.9.16';

        /**
         * Protocol implemented.
         *
         * @api public
         */

        io.protocol = 1;

        /**
         * Available transports, these will be populated with the available transports
         *
         * @api public
         */

        io.transports = [];

        /**
         * Keep track of jsonp callbacks.
         *
         * @api private
         */

        io.j = [];

        /**
         * Keep track of our io.Sockets
         *
         * @api private
         */
        io.sockets = {};


        /**
         * Manages connections to hosts.
         *
         * @param {String} uri
         * @Param {Boolean} force creation of new socket (defaults to false)
         * @api public
         */

        io.connect = function (host, details) {
            var uri = io.util.parseUri(host)
                , uuri
                , socket;

            if (global && global.location) {
                uri.protocol = uri.protocol || global.location.protocol.slice(0, -1);
                uri.host = uri.host || (global.document
                    ? global.document.domain : global.location.hostname);
                uri.port = uri.port || global.location.port;
            }

            uuri = io.util.uniqueUri(uri);

            var options = {
                host: uri.host, secure: 'https' == uri.protocol, port: uri.port || ('https' == uri.protocol ? 443 : 80), query: uri.query || ''
            };

            io.util.merge(options, details);

            if (options['force new connection'] || !io.sockets[uuri]) {
                socket = new io.Socket(options);
            }

            if (!options['force new connection'] && socket) {
                io.sockets[uuri] = socket;
            }

            socket = socket || io.sockets[uuri];

            // if path is different from '' or /
            return socket.of(uri.path.length > 1 ? uri.path : '');
        };

    })('object' === typeof module ? module.exports : (this.io = {}), this);
    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, global) {

        /**
         * Utilities namespace.
         *
         * @namespace
         */

        var util = exports.util = {};

        /**
         * Parses an URI
         *
         * @author Steven Levithan <stevenlevithan.com> (MIT license)
         * @api public
         */

        var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

        var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password',
            'host', 'port', 'relative', 'path', 'directory', 'file', 'query',
            'anchor'];

        util.parseUri = function (str) {
            var m = re.exec(str || '')
                , uri = {}
                , i = 14;

            while (i--) {
                uri[parts[i]] = m[i] || '';
            }

            return uri;
        };

        /**
         * Produces a unique url that identifies a Socket.IO connection.
         *
         * @param {Object} uri
         * @api public
         */

        util.uniqueUri = function (uri) {
            var protocol = uri.protocol
                , host = uri.host
                , port = uri.port;

            if ('document' in global) {
                host = host || document.domain;
                port = port || (protocol == 'https'
                    && document.location.protocol !== 'https:' ? 443 : document.location.port);
            } else {
                host = host || 'localhost';

                if (!port && protocol == 'https') {
                    port = 443;
                }
            }

            return (protocol || 'http') + '://' + host + ':' + (port || 80);
        };

        /**
         * Mergest 2 query strings in to once unique query string
         *
         * @param {String} base
         * @param {String} addition
         * @api public
         */

        util.query = function (base, addition) {
            var query = util.chunkQuery(base || '')
                , components = [];

            util.merge(query, util.chunkQuery(addition || ''));
            for (var part in query) {
                if (query.hasOwnProperty(part)) {
                    components.push(part + '=' + query[part]);
                }
            }

            return components.length ? '?' + components.join('&') : '';
        };

        /**
         * Transforms a querystring in to an object
         *
         * @param {String} qs
         * @api public
         */

        util.chunkQuery = function (qs) {
            var query = {}
                , params = qs.split('&')
                , i = 0
                , l = params.length
                , kv;

            for (; i < l; ++i) {
                kv = params[i].split('=');
                if (kv[0]) {
                    query[kv[0]] = kv[1];
                }
            }

            return query;
        };

        /**
         * Executes the given function when the page is loaded.
         *
         *     io.util.load(function () { console.log('page loaded'); });
         *
         * @param {Function} fn
         * @api public
         */

        var pageLoaded = false;

        util.load = function (fn) {
            if ('document' in global && document.readyState === 'complete' || pageLoaded) {
                return fn();
            }

            util.on(global, 'load', fn, false);
        };

        /**
         * Adds an event.
         *
         * @api private
         */

        util.on = function (element, event, fn, capture) {
            if (element.attachEvent) {
                element.attachEvent('on' + event, fn);
            } else if (element.addEventListener) {
                element.addEventListener(event, fn, capture);
            }
        };

        /**
         * Generates the correct `XMLHttpRequest` for regular and cross domain requests.
         *
         * @param {Boolean} [xdomain] Create a request that can be used cross domain.
         * @returns {XMLHttpRequest|false} If we can create a XMLHttpRequest.
         * @api private
         */

        util.request = function (xdomain) {

            if (xdomain && 'undefined' != typeof XDomainRequest && !util.ua.hasCORS) {
                return new XDomainRequest();
            }

            if ('undefined' != typeof XMLHttpRequest && (!xdomain || util.ua.hasCORS)) {
                return new XMLHttpRequest();
            }

            if (!xdomain) {
                try {
                    return new window[(['Active'].concat('Object').join('X'))]('Microsoft.XMLHTTP');
                } catch (e) {
                }
            }

            return null;
        };

        /**
         * XHR based transport constructor.
         *
         * @constructor
         * @api public
         */

        /**
         * Change the internal pageLoaded value.
         */

        if ('undefined' != typeof window) {
            util.load(function () {
                pageLoaded = true;
            });
        }

        /**
         * Defers a function to ensure a spinner is not displayed by the browser
         *
         * @param {Function} fn
         * @api public
         */

        util.defer = function (fn) {
            if (!util.ua.webkit || 'undefined' != typeof importScripts) {
                return fn();
            }

            util.load(function () {
                setTimeout(fn, 100);
            });
        };

        /**
         * Merges two objects.
         *
         * @api public
         */

        util.merge = function merge(target, additional, deep, lastseen) {
            var seen = lastseen || []
                , depth = typeof deep == 'undefined' ? 2 : deep
                , prop;

            for (prop in additional) {
                if (additional.hasOwnProperty(prop) && util.indexOf(seen, prop) < 0) {
                    if (typeof target[prop] !== 'object' || !depth) {
                        target[prop] = additional[prop];
                        seen.push(additional[prop]);
                    } else {
                        util.merge(target[prop], additional[prop], depth - 1, seen);
                    }
                }
            }

            return target;
        };

        /**
         * Merges prototypes from objects
         *
         * @api public
         */

        util.mixin = function (ctor, ctor2) {
            util.merge(ctor.prototype, ctor2.prototype);
        };

        /**
         * Shortcut for prototypical and static inheritance.
         *
         * @api private
         */

        util.inherit = function (ctor, ctor2) {
            function f() {
            };
            f.prototype = ctor2.prototype;
            ctor.prototype = new f;
        };

        /**
         * Checks if the given object is an Array.
         *
         *     io.util.isArray([]); // true
         *     io.util.isArray({}); // false
         *
         * @param Object obj
         * @api public
         */

        util.isArray = Array.isArray || function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };

        /**
         * Intersects values of two arrays into a third
         *
         * @api public
         */

        util.intersect = function (arr, arr2) {
            var ret = []
                , longest = arr.length > arr2.length ? arr : arr2
                , shortest = arr.length > arr2.length ? arr2 : arr;

            for (var i = 0, l = shortest.length; i < l; i++) {
                if (~util.indexOf(longest, shortest[i]))
                    ret.push(shortest[i]);
            }

            return ret;
        };

        /**
         * Array indexOf compatibility.
         *
         * @see bit.ly/a5Dxa2
         * @api public
         */

        util.indexOf = function (arr, o, i) {

            for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
                 i < j && arr[i] !== o; i++) {
            }

            return j <= i ? -1 : i;
        };

        /**
         * Converts enumerables to array.
         *
         * @api public
         */

        util.toArray = function (enu) {
            var arr = [];

            for (var i = 0, l = enu.length; i < l; i++)
                arr.push(enu[i]);

            return arr;
        };

        /**
         * UA / engines detection namespace.
         *
         * @namespace
         */

        util.ua = {};

        /**
         * Whether the UA supports CORS for XHR.
         *
         * @api public
         */

        util.ua.hasCORS = 'undefined' != typeof XMLHttpRequest && (function () {
            try {
                var a = new XMLHttpRequest();
            } catch (e) {
                return false;
            }

            return a.withCredentials != undefined;
        })();

        /**
         * Detect webkit.
         *
         * @api public
         */

        util.ua.webkit = 'undefined' != typeof navigator
            && /webkit/i.test(navigator.userAgent);

        /**
         * Detect iPad/iPhone/iPod.
         *
         * @api public
         */

        util.ua.iDevice = 'undefined' != typeof navigator
            && /iPad|iPhone|iPod/i.test(navigator.userAgent);

    })('undefined' != typeof io ? io : module.exports, this);
    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io) {

        /**
         * Expose constructor.
         */

        exports.EventEmitter = EventEmitter;

        /**
         * Event emitter constructor.
         *
         * @api public.
         */

        function EventEmitter() {
        };

        /**
         * Adds a listener
         *
         * @api public
         */

        EventEmitter.prototype.on = function (name, fn) {
            if (!this.$events) {
                this.$events = {};
            }

            if (!this.$events[name]) {
                this.$events[name] = fn;
            } else if (io.util.isArray(this.$events[name])) {
                this.$events[name].push(fn);
            } else {
                this.$events[name] = [this.$events[name], fn];
            }

            return this;
        };

        EventEmitter.prototype.addListener = EventEmitter.prototype.on;

        /**
         * Adds a volatile listener.
         *
         * @api public
         */

        EventEmitter.prototype.once = function (name, fn) {
            var self = this;

            function on() {
                self.removeListener(name, on);
                fn.apply(this, arguments);
            };

            on.listener = fn;
            this.on(name, on);

            return this;
        };

        /**
         * Removes a listener.
         *
         * @api public
         */

        EventEmitter.prototype.removeListener = function (name, fn) {
            if (this.$events && this.$events[name]) {
                var list = this.$events[name];

                if (io.util.isArray(list)) {
                    var pos = -1;

                    for (var i = 0, l = list.length; i < l; i++) {
                        if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
                            pos = i;
                            break;
                        }
                    }

                    if (pos < 0) {
                        return this;
                    }

                    list.splice(pos, 1);

                    if (!list.length) {
                        delete this.$events[name];
                    }
                } else if (list === fn || (list.listener && list.listener === fn)) {
                    delete this.$events[name];
                }
            }

            return this;
        };

        /**
         * Removes all listeners for an event.
         *
         * @api public
         */

        EventEmitter.prototype.removeAllListeners = function (name) {
            if (name === undefined) {
                this.$events = {};
                return this;
            }

            if (this.$events && this.$events[name]) {
                this.$events[name] = null;
            }

            return this;
        };

        /**
         * Gets all listeners for a certain event.
         *
         * @api publci
         */

        EventEmitter.prototype.listeners = function (name) {
            if (!this.$events) {
                this.$events = {};
            }

            if (!this.$events[name]) {
                this.$events[name] = [];
            }

            if (!io.util.isArray(this.$events[name])) {
                this.$events[name] = [this.$events[name]];
            }

            return this.$events[name];
        };

        /**
         * Emits an event.
         *
         * @api public
         */

        EventEmitter.prototype.emit = function (name) {
            if (!this.$events) {
                return false;
            }

            var handler = this.$events[name];

            if (!handler) {
                return false;
            }

            var args = Array.prototype.slice.call(arguments, 1);

            if ('function' == typeof handler) {
                handler.apply(this, args);
            } else if (io.util.isArray(handler)) {
                var listeners = handler.slice();

                for (var i = 0, l = listeners.length; i < l; i++) {
                    listeners[i].apply(this, args);
                }
            } else {
                return false;
            }

            return true;
        };

    })(
            'undefined' != typeof io ? io : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
        );

    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    /**
     * Based on JSON2 (http://www.JSON.org/js.html).
     */

    (function (exports, nativeJSON) {
        "use strict";

        // use native JSON if it's available
        if (nativeJSON && nativeJSON.parse) {
            return exports.JSON = {
                parse: nativeJSON.parse, stringify: nativeJSON.stringify
            };
        }

        var JSON = exports.JSON = {};

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        function date(d, key) {
            return isFinite(d.valueOf()) ?
                d.getUTCFullYear() + '-' +
                    f(d.getUTCMonth() + 1) + '-' +
                    f(d.getUTCDate()) + 'T' +
                    f(d.getUTCHours()) + ':' +
                    f(d.getUTCMinutes()) + ':' +
                    f(d.getUTCSeconds()) + 'Z' : null;
        };

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }


        function str(key, holder) {

// Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

            if (value instanceof Date) {
                value = date(key);
            }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

// What happens next depends on the value's type.

            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                    return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

                case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                    if (!value) {
                        return 'null';
                    }

// Make an array to hold the partial results of stringifying this object value.

                    gap += indent;
                    partial = [];

// Is the value an array?

                    if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                        v = partial.length === 0 ? '[]' : gap ?
                            '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                            '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }

// If the replacer is an array, use it to select the members to be stringified.

                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {

// Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                    v = partial.length === 0 ? '{}' : gap ?
                        '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                        '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        }

// If the JSON object does not yet have a stringify method, give it one.

        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };

// If the JSON object does not yet have a parse method, give it one.

        JSON.parse = function (text, reviver) {
            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };

    })(
            'undefined' != typeof io ? io : module.exports
            , typeof JSON !== 'undefined' ? JSON : undefined
        );

    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io) {

        /**
         * Parser namespace.
         *
         * @namespace
         */

        var parser = exports.parser = {};

        /**
         * Packet types.
         */

        var packets = parser.packets = [
            'disconnect'
            , 'connect'
            , 'heartbeat'
            , 'message'
            , 'json'
            , 'event'
            , 'ack'
            , 'error'
            , 'noop'
        ];

        /**
         * Errors reasons.
         */

        var reasons = parser.reasons = [
            'transport not supported'
            , 'client not handshaken'
            , 'unauthorized'
        ];

        /**
         * Errors advice.
         */

        var advice = parser.advice = [
            'reconnect'
        ];

        /**
         * Shortcuts.
         */

        var JSON = io.JSON
            , indexOf = io.util.indexOf;

        /**
         * Encodes a packet.
         *
         * @api private
         */

        parser.encodePacket = function (packet) {
            var type = indexOf(packets, packet.type)
                , id = packet.id || ''
                , endpoint = packet.endpoint || ''
                , ack = packet.ack
                , data = null;

            switch (packet.type) {
                case 'error':
                    var reason = packet.reason ? indexOf(reasons, packet.reason) : ''
                        , adv = packet.advice ? indexOf(advice, packet.advice) : '';

                    if (reason !== '' || adv !== '')
                        data = reason + (adv !== '' ? ('+' + adv) : '');

                    break;

                case 'message':
                    if (packet.data !== '')
                        data = packet.data;
                    break;

                case 'event':
                    var ev = { name: packet.name };

                    if (packet.args && packet.args.length) {
                        ev.args = packet.args;
                    }

                    data = JSON.stringify(ev);
                    break;

                case 'json':
                    data = JSON.stringify(packet.data);
                    break;

                case 'connect':
                    if (packet.qs)
                        data = packet.qs;
                    break;

                case 'ack':
                    data = packet.ackId
                        + (packet.args && packet.args.length
                        ? '+' + JSON.stringify(packet.args) : '');
                    break;
            }

            // construct packet with required fragments
            var encoded = [
                type
                , id + (ack == 'data' ? '+' : '')
                , endpoint
            ];

            // data fragment is optional
            if (data !== null && data !== undefined)
                encoded.push(data);

            return encoded.join(':');
        };

        /**
         * Encodes multiple messages (payload).
         *
         * @param {Array} messages
         * @api private
         */

        parser.encodePayload = function (packets) {
            var decoded = '';

            if (packets.length == 1)
                return packets[0];

            for (var i = 0, l = packets.length; i < l; i++) {
                var packet = packets[i];
                decoded += '\ufffd' + packet.length + '\ufffd' + packets[i];
            }

            return decoded;
        };

        /**
         * Decodes a packet
         *
         * @api private
         */

        var regexp = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;

        parser.decodePacket = function (data) {
            var pieces = data.match(regexp);

            if (!pieces) return {};

            var id = pieces[2] || ''
                , data = pieces[5] || ''
                , packet = {
                    type: packets[pieces[1]], endpoint: pieces[4] || ''
                };

            // whether we need to acknowledge the packet
            if (id) {
                packet.id = id;
                if (pieces[3])
                    packet.ack = 'data';
                else
                    packet.ack = true;
            }

            // handle different packet types
            switch (packet.type) {
                case 'error':
                    var pieces = data.split('+');
                    packet.reason = reasons[pieces[0]] || '';
                    packet.advice = advice[pieces[1]] || '';
                    break;

                case 'message':
                    packet.data = data || '';
                    break;

                case 'event':
                    try {
                        var opts = JSON.parse(data);
                        packet.name = opts.name;
                        packet.args = opts.args;
                    } catch (e) {
                    }

                    packet.args = packet.args || [];
                    break;

                case 'json':
                    try {
                        packet.data = JSON.parse(data);
                    } catch (e) {
                    }
                    break;

                case 'connect':
                    packet.qs = data || '';
                    break;

                case 'ack':
                    var pieces = data.match(/^([0-9]+)(\+)?(.*)/);
                    if (pieces) {
                        packet.ackId = pieces[1];
                        packet.args = [];

                        if (pieces[3]) {
                            try {
                                packet.args = pieces[3] ? JSON.parse(pieces[3]) : [];
                            } catch (e) {
                            }
                        }
                    }
                    break;

                case 'disconnect':
                case 'heartbeat':
                    break;
            }
            ;

            return packet;
        };

        /**
         * Decodes data payload. Detects multiple messages
         *
         * @return {Array} messages
         * @api public
         */

        parser.decodePayload = function (data) {
            // IE doesn't like data[i] for unicode chars, charAt works fine
            if (data.charAt(0) == '\ufffd') {
                var ret = [];

                for (var i = 1, length = ''; i < data.length; i++) {
                    if (data.charAt(i) == '\ufffd') {
                        ret.push(parser.decodePacket(data.substr(i + 1).substr(0, length)));
                        i += Number(length) + 1;
                        length = '';
                    } else {
                        length += data.charAt(i);
                    }
                }

                return ret;
            } else {
                return [parser.decodePacket(data)];
            }
        };

    })(
            'undefined' != typeof io ? io : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
        );
    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io) {

        /**
         * Expose constructor.
         */

        exports.Transport = Transport;

        /**
         * This is the transport template for all supported transport methods.
         *
         * @constructor
         * @api public
         */

        function Transport(socket, sessid) {
            this.socket = socket;
            this.sessid = sessid;
        };

        /**
         * Apply EventEmitter mixin.
         */

        io.util.mixin(Transport, io.EventEmitter);


        /**
         * Indicates whether heartbeats is enabled for this transport
         *
         * @api private
         */

        Transport.prototype.heartbeats = function () {
            return true;
        };

        /**
         * Handles the response from the server. When a new response is received
         * it will automatically update the timeout, decode the message and
         * forwards the response to the onMessage function for further processing.
         *
         * @param {String} data Response from the server.
         * @api private
         */

        Transport.prototype.onData = function (data) {
            this.clearCloseTimeout();

            // If the connection in currently open (or in a reopening state) reset the close
            // timeout since we have just received data. This check is necessary so
            // that we don't reset the timeout on an explicitly disconnected connection.
            if (this.socket.connected || this.socket.connecting || this.socket.reconnecting) {
                this.setCloseTimeout();
            }

            if (data !== '') {
                // todo: we should only do decodePayload for xhr transports
                var msgs = io.parser.decodePayload(data);

                if (msgs && msgs.length) {
                    for (var i = 0, l = msgs.length; i < l; i++) {
                        this.onPacket(msgs[i]);
                    }
                }
            }

            return this;
        };

        /**
         * Handles packets.
         *
         * @api private
         */

        Transport.prototype.onPacket = function (packet) {
            this.socket.setHeartbeatTimeout();

            if (packet.type == 'heartbeat') {
                return this.onHeartbeat();
            }

            if (packet.type == 'connect' && packet.endpoint == '') {
                this.onConnect();
            }

            if (packet.type == 'error' && packet.advice == 'reconnect') {
                this.isOpen = false;
            }

            this.socket.onPacket(packet);

            return this;
        };

        /**
         * Sets close timeout
         *
         * @api private
         */

        Transport.prototype.setCloseTimeout = function () {
            if (!this.closeTimeout) {
                var self = this;

                this.closeTimeout = setTimeout(function () {
                    self.onDisconnect();
                }, this.socket.closeTimeout);
            }
        };

        /**
         * Called when transport disconnects.
         *
         * @api private
         */

        Transport.prototype.onDisconnect = function () {
            if (this.isOpen) this.close();
            this.clearTimeouts();
            this.socket.onDisconnect();
            return this;
        };

        /**
         * Called when transport connects
         *
         * @api private
         */

        Transport.prototype.onConnect = function () {
            this.socket.onConnect();
            return this;
        };

        /**
         * Clears close timeout
         *
         * @api private
         */

        Transport.prototype.clearCloseTimeout = function () {
            if (this.closeTimeout) {
                clearTimeout(this.closeTimeout);
                this.closeTimeout = null;
            }
        };

        /**
         * Clear timeouts
         *
         * @api private
         */

        Transport.prototype.clearTimeouts = function () {
            this.clearCloseTimeout();

            if (this.reopenTimeout) {
                clearTimeout(this.reopenTimeout);
            }
        };

        /**
         * Sends a packet
         *
         * @param {Object} packet object.
         * @api private
         */

        Transport.prototype.packet = function (packet) {
            this.send(io.parser.encodePacket(packet));
        };

        /**
         * Send the received heartbeat message back to server. So the server
         * knows we are still connected.
         *
         * @param {String} heartbeat Heartbeat response from the server.
         * @api private
         */

        Transport.prototype.onHeartbeat = function (heartbeat) {
            this.packet({ type: 'heartbeat' });
        };

        /**
         * Called when the transport opens.
         *
         * @api private
         */

        Transport.prototype.onOpen = function () {
            this.isOpen = true;
            this.clearCloseTimeout();
            this.socket.onOpen();
        };

        /**
         * Notifies the base when the connection with the Socket.IO server
         * has been disconnected.
         *
         * @api private
         */

        Transport.prototype.onClose = function () {
            var self = this;

            /* FIXME: reopen delay causing a infinit loop
    this.reopenTimeout = setTimeout(function () {
      self.open();
    }, this.socket.options['reopen delay']);*/

            this.isOpen = false;
            this.socket.onClose();
            this.onDisconnect();
        };

        /**
         * Generates a connection url based on the Socket.IO URL Protocol.
         * See <https://github.com/learnboost/socket.io-node/> for more details.
         *
         * @returns {String} Connection url
         * @api private
         */

        Transport.prototype.prepareUrl = function () {
            var options = this.socket.options;

            return this.scheme() + '://'
                + options.host + ':' + options.port + '/'
                + options.resource + '/' + io.protocol
                + '/' + this.name + '/' + this.sessid;
        };

        /**
         * Checks if the transport is ready to start a connection.
         *
         * @param {Socket} socket The socket instance that needs a transport
         * @param {Function} fn The callback
         * @api private
         */

        Transport.prototype.ready = function (socket, fn) {
            fn.call(this);
        };
    })(
            'undefined' != typeof io ? io : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
        );
    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io, global) {

        /**
         * Expose constructor.
         */

        exports.Socket = Socket;

        /**
         * Create a new `Socket.IO client` which can establish a persistent
         * connection with a Socket.IO enabled server.
         *
         * @api public
         */

        function Socket(options) {
            this.options = {
                port: 80, secure: false, document: 'document' in global ? document : false, resource: 'socket.io', transports: io.transports, 'connect timeout': 10000, 'try multiple transports': true, 'reconnect': true, 'reconnection delay': 500, 'reconnection limit': Infinity, 'reopen delay': 3000, 'max reconnection attempts': 10, 'sync disconnect on unload': false, 'auto connect': true, 'flash policy port': 10843, 'manualFlush': false
            };

            io.util.merge(this.options, options);

            this.connected = false;
            this.open = false;
            this.connecting = false;
            this.reconnecting = false;
            this.namespaces = {};
            this.buffer = [];
            this.doBuffer = false;

            if (this.options['sync disconnect on unload'] &&
                (!this.isXDomain() || io.util.ua.hasCORS)) {
                var self = this;
                io.util.on(global, 'beforeunload', function () {
                    self.disconnectSync();
                }, false);
            }

            if (this.options['auto connect']) {
                this.connect();
            }
        };

        /**
         * Apply EventEmitter mixin.
         */

        io.util.mixin(Socket, io.EventEmitter);

        /**
         * Returns a namespace listener/emitter for this socket
         *
         * @api public
         */

        Socket.prototype.of = function (name) {
            if (!this.namespaces[name]) {
                this.namespaces[name] = new io.SocketNamespace(this, name);

                if (name !== '') {
                    this.namespaces[name].packet({ type: 'connect' });
                }
            }

            return this.namespaces[name];
        };

        /**
         * Emits the given event to the Socket and all namespaces
         *
         * @api private
         */

        Socket.prototype.publish = function () {
            this.emit.apply(this, arguments);

            var nsp;

            for (var i in this.namespaces) {
                if (this.namespaces.hasOwnProperty(i)) {
                    nsp = this.of(i);
                    nsp.$emit.apply(nsp, arguments);
                }
            }
        };

        /**
         * Performs the handshake
         *
         * @api private
         */

        function empty() {
        };

        Socket.prototype.handshake = function (fn) {
            var self = this
                , options = this.options;

            function complete(data) {
                if (data instanceof Error) {
                    self.connecting = false;
                    self.onError(data.message);
                } else {
                    fn.apply(null, data.split(':'));
                }
            };

            var url = [
                'http' + (options.secure ? 's' : '') + ':/'
                , options.host + ':' + options.port
                , options.resource
                , io.protocol
                , io.util.query(this.options.query, 't=' + +new Date)
            ].join('/');

            if (this.isXDomain() && !io.util.ua.hasCORS) {
                var insertAt = document.getElementsByTagName('script')[0]
                    , script = document.createElement('script');

                script.src = url + '&jsonp=' + io.j.length;
                insertAt.parentNode.insertBefore(script, insertAt);

                io.j.push(function (data) {
                    complete(data);
                    script.parentNode.removeChild(script);
                });
            } else {
                var xhr = io.util.request();

                xhr.open('GET', url, true);
                if (this.isXDomain()) {
                    xhr.withCredentials = true;
                }
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        xhr.onreadystatechange = empty;

                        if (xhr.status == 200) {
                            complete(xhr.responseText);
                        } else if (xhr.status == 403) {
                            self.onError(xhr.responseText);
                        } else {
                            self.connecting = false;
                            !self.reconnecting && self.onError(xhr.responseText);
                        }
                    }
                };
                xhr.send(null);
            }
        };

        /**
         * Find an available transport based on the options supplied in the constructor.
         *
         * @api private
         */

        Socket.prototype.getTransport = function (override) {
            var transports = override || this.transports, match;

            for (var i = 0, transport; transport = transports[i]; i++) {
                if (io.Transport[transport]
                    && io.Transport[transport].check(this)
                    && (!this.isXDomain() || io.Transport[transport].xdomainCheck(this))) {
                    return new io.Transport[transport](this, this.sessionid);
                }
            }

            return null;
        };

        /**
         * Connects to the server.
         *
         * @param {Function} [fn] Callback.
         * @returns {io.Socket}
         * @api public
         */

        Socket.prototype.connect = function (fn) {
            if (this.connecting) {
                return this;
            }

            var self = this;
            self.connecting = true;

            this.handshake(function (sid, heartbeat, close, transports) {
                self.sessionid = sid;
                self.closeTimeout = close * 1000;
                self.heartbeatTimeout = heartbeat * 1000;
                if (!self.transports)
                    self.transports = self.origTransports = (transports ? io.util.intersect(
                        transports.split(',')
                        , self.options.transports
                    ) : self.options.transports);

                self.setHeartbeatTimeout();

                function connect(transports) {
                    if (self.transport) self.transport.clearTimeouts();

                    self.transport = self.getTransport(transports);
                    if (!self.transport) return self.publish('connect_failed');

                    // once the transport is ready
                    self.transport.ready(self, function () {
                        self.connecting = true;
                        self.publish('connecting', self.transport.name);
                        self.transport.open();

                        if (self.options['connect timeout']) {
                            self.connectTimeoutTimer = setTimeout(function () {
                                if (!self.connected) {
                                    self.connecting = false;

                                    if (self.options['try multiple transports']) {
                                        var remaining = self.transports;

                                        while (remaining.length > 0 && remaining.splice(0, 1)[0] !=
                                            self.transport.name) {
                                        }

                                        if (remaining.length) {
                                            connect(remaining);
                                        } else {
                                            self.publish('connect_failed');
                                        }
                                    }
                                }
                            }, self.options['connect timeout']);
                        }
                    });
                }

                connect(self.transports);

                self.once('connect', function () {
                    clearTimeout(self.connectTimeoutTimer);

                    fn && typeof fn == 'function' && fn();
                });
            });

            return this;
        };

        /**
         * Clears and sets a new heartbeat timeout using the value given by the
         * server during the handshake.
         *
         * @api private
         */

        Socket.prototype.setHeartbeatTimeout = function () {
            clearTimeout(this.heartbeatTimeoutTimer);
            if (this.transport && !this.transport.heartbeats()) return;

            var self = this;
            this.heartbeatTimeoutTimer = setTimeout(function () {
                self.transport.onClose();
            }, this.heartbeatTimeout);
        };

        /**
         * Sends a message.
         *
         * @param {Object} data packet.
         * @returns {io.Socket}
         * @api public
         */

        Socket.prototype.packet = function (data) {
            if (this.connected && !this.doBuffer) {
                this.transport.packet(data);
            } else {
                this.buffer.push(data);
            }

            return this;
        };

        /**
         * Sets buffer state
         *
         * @api private
         */

        Socket.prototype.setBuffer = function (v) {
            this.doBuffer = v;

            if (!v && this.connected && this.buffer.length) {
                if (!this.options['manualFlush']) {
                    this.flushBuffer();
                }
            }
        };

        /**
         * Flushes the buffer data over the wire.
         * To be invoked manually when 'manualFlush' is set to true.
         *
         * @api public
         */

        Socket.prototype.flushBuffer = function () {
            this.transport.payload(this.buffer);
            this.buffer = [];
        };


        /**
         * Disconnect the established connect.
         *
         * @returns {io.Socket}
         * @api public
         */

        Socket.prototype.disconnect = function () {
            if (this.connected || this.connecting) {
                if (this.open) {
                    this.of('').packet({ type: 'disconnect' });
                }

                // handle disconnection immediately
                this.onDisconnect('booted');
            }

            return this;
        };

        /**
         * Disconnects the socket with a sync XHR.
         *
         * @api private
         */

        Socket.prototype.disconnectSync = function () {
            // ensure disconnection
            var xhr = io.util.request();
            var uri = [
                'http' + (this.options.secure ? 's' : '') + ':/'
                , this.options.host + ':' + this.options.port
                , this.options.resource
                , io.protocol
                , ''
                , this.sessionid
            ].join('/') + '/?disconnect=1';

            xhr.open('GET', uri, false);
            xhr.send(null);

            // handle disconnection immediately
            this.onDisconnect('booted');
        };

        /**
         * Check if we need to use cross domain enabled transports. Cross domain would
         * be a different port or different domain name.
         *
         * @returns {Boolean}
         * @api private
         */

        Socket.prototype.isXDomain = function () {

            var port = global.location.port ||
                ('https:' == global.location.protocol ? 443 : 80);

            return this.options.host !== global.location.hostname
                || this.options.port != port;
        };

        /**
         * Called upon handshake.
         *
         * @api private
         */

        Socket.prototype.onConnect = function () {
            if (!this.connected) {
                this.connected = true;
                this.connecting = false;
                if (!this.doBuffer) {
                    // make sure to flush the buffer
                    this.setBuffer(false);
                }
                this.emit('connect');
            }
        };

        /**
         * Called when the transport opens
         *
         * @api private
         */

        Socket.prototype.onOpen = function () {
            this.open = true;
        };

        /**
         * Called when the transport closes.
         *
         * @api private
         */

        Socket.prototype.onClose = function () {
            this.open = false;
            clearTimeout(this.heartbeatTimeoutTimer);
        };

        /**
         * Called when the transport first opens a connection
         *
         * @param text
         */

        Socket.prototype.onPacket = function (packet) {
            this.of(packet.endpoint).onPacket(packet);
        };

        /**
         * Handles an error.
         *
         * @api private
         */

        Socket.prototype.onError = function (err) {
            if (err && err.advice) {
                if (err.advice === 'reconnect' && (this.connected || this.connecting)) {
                    this.disconnect();
                    if (this.options.reconnect) {
                        this.reconnect();
                    }
                }
            }

            this.publish('error', err && err.reason ? err.reason : err);
        };

        /**
         * Called when the transport disconnects.
         *
         * @api private
         */

        Socket.prototype.onDisconnect = function (reason) {
            var wasConnected = this.connected
                , wasConnecting = this.connecting;

            this.connected = false;
            this.connecting = false;
            this.open = false;

            if (wasConnected || wasConnecting) {
                this.transport.close();
                this.transport.clearTimeouts();
                if (wasConnected) {
                    this.publish('disconnect', reason);

                    if ('booted' != reason && this.options.reconnect && !this.reconnecting) {
                        this.reconnect();
                    }
                }
            }
        };

        /**
         * Called upon reconnection.
         *
         * @api private
         */

        Socket.prototype.reconnect = function () {
            this.reconnecting = true;
            this.reconnectionAttempts = 0;
            this.reconnectionDelay = this.options['reconnection delay'];

            var self = this
                , maxAttempts = this.options['max reconnection attempts']
                , tryMultiple = this.options['try multiple transports']
                , limit = this.options['reconnection limit'];

            function reset() {
                if (self.connected) {
                    for (var i in self.namespaces) {
                        if (self.namespaces.hasOwnProperty(i) && '' !== i) {
                            self.namespaces[i].packet({ type: 'connect' });
                        }
                    }
                    self.publish('reconnect', self.transport.name, self.reconnectionAttempts);
                }

                clearTimeout(self.reconnectionTimer);

                self.removeListener('connect_failed', maybeReconnect);
                self.removeListener('connect', maybeReconnect);

                self.reconnecting = false;

                delete self.reconnectionAttempts;
                delete self.reconnectionDelay;
                delete self.reconnectionTimer;
                delete self.redoTransports;

                self.options['try multiple transports'] = tryMultiple;
            };

            function maybeReconnect() {
                if (!self.reconnecting) {
                    return;
                }

                if (self.connected) {
                    return reset();
                }
                ;

                if (self.connecting && self.reconnecting) {
                    return self.reconnectionTimer = setTimeout(maybeReconnect, 1000);
                }

                if (self.reconnectionAttempts++ >= maxAttempts) {
                    if (!self.redoTransports) {
                        self.on('connect_failed', maybeReconnect);
                        self.options['try multiple transports'] = true;
                        self.transports = self.origTransports;
                        self.transport = self.getTransport();
                        self.redoTransports = true;
                        self.connect();
                    } else {
                        self.publish('reconnect_failed');
                        reset();
                    }
                } else {
                    if (self.reconnectionDelay < limit) {
                        self.reconnectionDelay *= 2; // exponential back off
                    }

                    self.connect();
                    self.publish('reconnecting', self.reconnectionDelay, self.reconnectionAttempts);
                    self.reconnectionTimer = setTimeout(maybeReconnect, self.reconnectionDelay);
                }
            };

            this.options['try multiple transports'] = false;
            this.reconnectionTimer = setTimeout(maybeReconnect, this.reconnectionDelay);

            this.on('connect', maybeReconnect);
        };

    })(
            'undefined' != typeof io ? io : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
            , this
        );
    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io) {

        /**
         * Expose constructor.
         */

        exports.SocketNamespace = SocketNamespace;

        /**
         * Socket namespace constructor.
         *
         * @constructor
         * @api public
         */

        function SocketNamespace(socket, name) {
            this.socket = socket;
            this.name = name || '';
            this.flags = {};
            this.json = new Flag(this, 'json');
            this.ackPackets = 0;
            this.acks = {};
        };

        /**
         * Apply EventEmitter mixin.
         */

        io.util.mixin(SocketNamespace, io.EventEmitter);

        /**
         * Copies emit since we override it
         *
         * @api private
         */

        SocketNamespace.prototype.$emit = io.EventEmitter.prototype.emit;

        /**
         * Creates a new namespace, by proxying the request to the socket. This
         * allows us to use the synax as we do on the server.
         *
         * @api public
         */

        SocketNamespace.prototype.of = function () {
            return this.socket.of.apply(this.socket, arguments);
        };

        /**
         * Sends a packet.
         *
         * @api private
         */

        SocketNamespace.prototype.packet = function (packet) {
            packet.endpoint = this.name;
            this.socket.packet(packet);
            this.flags = {};
            return this;
        };

        /**
         * Sends a message
         *
         * @api public
         */

        SocketNamespace.prototype.send = function (data, fn) {
            var packet = {
                type: this.flags.json ? 'json' : 'message', data: data
            };

            if ('function' == typeof fn) {
                packet.id = ++this.ackPackets;
                packet.ack = true;
                this.acks[packet.id] = fn;
            }

            return this.packet(packet);
        };

        /**
         * Emits an event
         *
         * @api public
         */

        SocketNamespace.prototype.emit = function (name) {
            var args = Array.prototype.slice.call(arguments, 1)
                , lastArg = args[args.length - 1]
                , packet = {
                    type: 'event', name: name
                };

            if ('function' == typeof lastArg) {
                packet.id = ++this.ackPackets;
                packet.ack = 'data';
                this.acks[packet.id] = lastArg;
                args = args.slice(0, args.length - 1);
            }

            packet.args = args;

            return this.packet(packet);
        };

        /**
         * Disconnects the namespace
         *
         * @api private
         */

        SocketNamespace.prototype.disconnect = function () {
            if (this.name === '') {
                this.socket.disconnect();
            } else {
                this.packet({ type: 'disconnect' });
                this.$emit('disconnect');
            }

            return this;
        };

        /**
         * Handles a packet
         *
         * @api private
         */

        SocketNamespace.prototype.onPacket = function (packet) {
            var self = this;

            function ack() {
                self.packet({
                    type: 'ack', args: io.util.toArray(arguments), ackId: packet.id
                });
            };

            switch (packet.type) {
                case 'connect':
                    this.$emit('connect');
                    break;

                case 'disconnect':
                    if (this.name === '') {
                        this.socket.onDisconnect(packet.reason || 'booted');
                    } else {
                        this.$emit('disconnect', packet.reason);
                    }
                    break;

                case 'message':
                case 'json':
                    var params = ['message', packet.data];

                    if (packet.ack == 'data') {
                        params.push(ack);
                    } else if (packet.ack) {
                        this.packet({ type: 'ack', ackId: packet.id });
                    }

                    this.$emit.apply(this, params);
                    break;

                case 'event':
                    var params = [packet.name].concat(packet.args);

                    if (packet.ack == 'data')
                        params.push(ack);

                    this.$emit.apply(this, params);
                    break;

                case 'ack':
                    if (this.acks[packet.ackId]) {
                        this.acks[packet.ackId].apply(this, packet.args);
                        delete this.acks[packet.ackId];
                    }
                    break;

                case 'error':
                    if (packet.advice) {
                        this.socket.onError(packet);
                    } else {
                        if (packet.reason == 'unauthorized') {
                            this.$emit('connect_failed', packet.reason);
                        } else {
                            this.$emit('error', packet.reason);
                        }
                    }
                    break;
            }
        };

        /**
         * Flag interface.
         *
         * @api private
         */

        function Flag(nsp, name) {
            this.namespace = nsp;
            this.name = name;
        };

        /**
         * Send a message
         *
         * @api public
         */

        Flag.prototype.send = function () {
            this.namespace.flags[this.name] = true;
            this.namespace.send.apply(this.namespace, arguments);
        };

        /**
         * Emit an event
         *
         * @api public
         */

        Flag.prototype.emit = function () {
            this.namespace.flags[this.name] = true;
            this.namespace.emit.apply(this.namespace, arguments);
        };

    })(
            'undefined' != typeof io ? io : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
        );

    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io, global) {

        /**
         * Expose constructor.
         */

        exports.websocket = WS;

        /**
         * The WebSocket transport uses the HTML5 WebSocket API to establish an
         * persistent connection with the Socket.IO server. This transport will also
         * be inherited by the FlashSocket fallback as it provides a API compatible
         * polyfill for the WebSockets.
         *
         * @constructor
         * @extends {io.Transport}
         * @api public
         */

        function WS(socket) {
            io.Transport.apply(this, arguments);
        };

        /**
         * Inherits from Transport.
         */

        io.util.inherit(WS, io.Transport);

        /**
         * Transport name
         *
         * @api public
         */

        WS.prototype.name = 'websocket';

        /**
         * Initializes a new `WebSocket` connection with the Socket.IO server. We attach
         * all the appropriate listeners to handle the responses from the server.
         *
         * @returns {Transport}
         * @api public
         */

        WS.prototype.open = function () {
            var query = io.util.query(this.socket.options.query)
                , self = this
                , Socket


            if (!Socket) {
                Socket = global.MozWebSocket || global.WebSocket;
            }

            this.websocket = new Socket(this.prepareUrl() + query);

            this.websocket.onopen = function () {
                self.onOpen();
                self.socket.setBuffer(false);
            };
            this.websocket.onmessage = function (ev) {
                self.onData(ev.data);
            };
            this.websocket.onclose = function () {
                self.onClose();
                self.socket.setBuffer(true);
            };
            this.websocket.onerror = function (e) {
                self.onError(e);
            };

            return this;
        };

        /**
         * Send a message to the Socket.IO server. The message will automatically be
         * encoded in the correct message format.
         *
         * @returns {Transport}
         * @api public
         */

        // Do to a bug in the current IDevices browser, we need to wrap the send in a 
        // setTimeout, when they resume from sleeping the browser will crash if 
        // we don't allow the browser time to detect the socket has been closed
        if (io.util.ua.iDevice) {
            WS.prototype.send = function (data) {
                var self = this;
                setTimeout(function () {
                    self.websocket.send(data);
                }, 0);
                return this;
            };
        } else {
            WS.prototype.send = function (data) {
                this.websocket.send(data);
                return this;
            };
        }

        /**
         * Payload
         *
         * @api private
         */

        WS.prototype.payload = function (arr) {
            for (var i = 0, l = arr.length; i < l; i++) {
                this.packet(arr[i]);
            }
            return this;
        };

        /**
         * Disconnect the established `WebSocket` connection.
         *
         * @returns {Transport}
         * @api public
         */

        WS.prototype.close = function () {
            this.websocket.close();
            return this;
        };

        /**
         * Handle the errors that `WebSocket` might be giving when we
         * are attempting to connect or send messages.
         *
         * @param {Error} e The error.
         * @api private
         */

        WS.prototype.onError = function (e) {
            this.socket.onError(e);
        };

        /**
         * Returns the appropriate scheme for the URI generation.
         *
         * @api private
         */
        WS.prototype.scheme = function () {
            return this.socket.options.secure ? 'wss' : 'ws';
        };

        /**
         * Checks if the browser has support for native `WebSockets` and that
         * it's not the polyfill created for the FlashSocket transport.
         *
         * @return {Boolean}
         * @api public
         */

        WS.check = function () {
            return ('WebSocket' in global && !('__addTask' in WebSocket))
                || 'MozWebSocket' in global;
        };

        /**
         * Check if the `WebSocket` transport support cross domain communications.
         *
         * @returns {Boolean}
         * @api public
         */

        WS.xdomainCheck = function () {
            return true;
        };

        /**
         * Add the transport to your public io.transports array.
         *
         * @api private
         */

        io.transports.push('websocket');

    })(
            'undefined' != typeof io ? io.Transport : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
            , this
        );

    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io) {

        /**
         * Expose constructor.
         */

        exports.flashsocket = Flashsocket;

        /**
         * The FlashSocket transport. This is a API wrapper for the HTML5 WebSocket
         * specification. It uses a .swf file to communicate with the server. If you want
         * to serve the .swf file from a other server than where the Socket.IO script is
         * coming from you need to use the insecure version of the .swf. More information
         * about this can be found on the github page.
         *
         * @constructor
         * @extends {io.Transport.websocket}
         * @api public
         */

        function Flashsocket() {
            io.Transport.websocket.apply(this, arguments);
        };

        /**
         * Inherits from Transport.
         */

        io.util.inherit(Flashsocket, io.Transport.websocket);

        /**
         * Transport name
         *
         * @api public
         */

        Flashsocket.prototype.name = 'flashsocket';

        /**
         * Disconnect the established `FlashSocket` connection. This is done by adding a
         * new task to the FlashSocket. The rest will be handled off by the `WebSocket`
         * transport.
         *
         * @returns {Transport}
         * @api public
         */

        Flashsocket.prototype.open = function () {
            var self = this
                , args = arguments;

            WebSocket.__addTask(function () {
                io.Transport.websocket.prototype.open.apply(self, args);
            });
            return this;
        };

        /**
         * Sends a message to the Socket.IO server. This is done by adding a new
         * task to the FlashSocket. The rest will be handled off by the `WebSocket`
         * transport.
         *
         * @returns {Transport}
         * @api public
         */

        Flashsocket.prototype.send = function () {
            var self = this, args = arguments;
            WebSocket.__addTask(function () {
                io.Transport.websocket.prototype.send.apply(self, args);
            });
            return this;
        };

        /**
         * Disconnects the established `FlashSocket` connection.
         *
         * @returns {Transport}
         * @api public
         */

        Flashsocket.prototype.close = function () {
            WebSocket.__tasks.length = 0;
            io.Transport.websocket.prototype.close.call(this);
            return this;
        };

        /**
         * The WebSocket fall back needs to append the flash container to the body
         * element, so we need to make sure we have access to it. Or defer the call
         * until we are sure there is a body element.
         *
         * @param {Socket} socket The socket instance that needs a transport
         * @param {Function} fn The callback
         * @api private
         */

        Flashsocket.prototype.ready = function (socket, fn) {
            function init() {
                var options = socket.options
                    , port = options['flash policy port']
                    , path = [
                        'http' + (options.secure ? 's' : '') + ':/'
                        , options.host + ':' + options.port
                        , options.resource
                        , 'static/flashsocket'
                        , 'WebSocketMain' + (socket.isXDomain() ? 'Insecure' : '') + '.swf'
                    ];

                // Only start downloading the swf file when the checked that this browser
                // actually supports it
                if (!Flashsocket.loaded) {
                    if (typeof WEB_SOCKET_SWF_LOCATION === 'undefined') {
                        // Set the correct file based on the XDomain settings
                        WEB_SOCKET_SWF_LOCATION = path.join('/');
                    }

                    if (port !== 843) {
                        WebSocket.loadFlashPolicyFile('xmlsocket://' + options.host + ':' + port);
                    }

                    WebSocket.__initialize();
                    Flashsocket.loaded = true;
                }

                fn.call(self);
            }

            var self = this;
            if (document.body) return init();

            io.util.load(init);
        };

        /**
         * Check if the FlashSocket transport is supported as it requires that the Adobe
         * Flash Player plug-in version `10.0.0` or greater is installed. And also check if
         * the polyfill is correctly loaded.
         *
         * @returns {Boolean}
         * @api public
         */

        Flashsocket.check = function () {
            if (
                typeof WebSocket == 'undefined'
                    || !('__initialize' in WebSocket) || !swfobject
                ) return false;

            return swfobject.getFlashPlayerVersion().major >= 10;
        };

        /**
         * Check if the FlashSocket transport can be used as cross domain / cross origin
         * transport. Because we can't see which type (secure or insecure) of .swf is used
         * we will just return true.
         *
         * @returns {Boolean}
         * @api public
         */

        Flashsocket.xdomainCheck = function () {
            return true;
        };

        /**
         * Disable AUTO_INITIALIZATION
         */

        if (typeof window != 'undefined') {
            WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
        }

        /**
         * Add the transport to your public io.transports array.
         *
         * @api private
         */

        io.transports.push('flashsocket');
    })(
            'undefined' != typeof io ? io.Transport : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
        );
    /*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
    if ('undefined' != typeof window) {
        var swfobject = function () {
            var D = "undefined", r = "object", S = "Shockwave Flash", W = "ShockwaveFlash.ShockwaveFlash", q = "application/x-shockwave-flash", R = "SWFObjectExprInst", x = "onreadystatechange", O = window, j = document, t = navigator, T = false, U = [h], o = [], N = [], I = [], l, Q, E, B, J = false, a = false, n, G, m = true, M = function () {
                var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D, ah = t.userAgent.toLowerCase(), Y = t.platform.toLowerCase(), ae = Y ? /win/.test(Y) : /win/.test(ah), ac = Y ? /mac/.test(Y) : /mac/.test(ah), af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, X = !+"\v1", ag = [0, 0, 0], ab = null;
                if (typeof t.plugins != D && typeof t.plugins[S] == r) {
                    ab = t.plugins[S].description;
                    if (ab && !(typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
                        T = true;
                        X = false;
                        ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                        ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
                        ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                        ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
                    }
                } else {
                    if (typeof O[(['Active'].concat('Object').join('X'))] != D) {
                        try {
                            var ad = new window[(['Active'].concat('Object').join('X'))](W);
                            if (ad) {
                                ab = ad.GetVariable("$version");
                                if (ab) {
                                    X = true;
                                    ab = ab.split(" ")[1].split(",");
                                    ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                                }
                            }
                        } catch (Z) {
                        }
                    }
                }
                return{w3: aa, pv: ag, wk: af, ie: X, win: ae, mac: ac}
            }(), k = function () {
                if (!M.w3) {
                    return
                }
                if ((typeof j.readyState != D && j.readyState == "complete") || (typeof j.readyState == D && (j.getElementsByTagName("body")[0] || j.body))) {
                    f()
                }
                if (!J) {
                    if (typeof j.addEventListener != D) {
                        j.addEventListener("DOMContentLoaded", f, false)
                    }
                    if (M.ie && M.win) {
                        j.attachEvent(x, function () {
                            if (j.readyState == "complete") {
                                j.detachEvent(x, arguments.callee);
                                f()
                            }
                        });
                        if (O == top) {
                            (function () {
                                if (J) {
                                    return
                                }
                                try {
                                    j.documentElement.doScroll("left")
                                } catch (X) {
                                    setTimeout(arguments.callee, 0);
                                    return
                                }
                                f()
                            })()
                        }
                    }
                    if (M.wk) {
                        (function () {
                            if (J) {
                                return
                            }
                            if (!/loaded|complete/.test(j.readyState)) {
                                setTimeout(arguments.callee, 0);
                                return
                            }
                            f()
                        })()
                    }
                    s(f)
                }
            }();

            function f() {
                if (J) {
                    return
                }
                try {
                    var Z = j.getElementsByTagName("body")[0].appendChild(C("span"));
                    Z.parentNode.removeChild(Z)
                } catch (aa) {
                    return
                }
                J = true;
                var X = U.length;
                for (var Y = 0; Y < X; Y++) {
                    U[Y]()
                }
            }

            function K(X) {
                if (J) {
                    X()
                } else {
                    U[U.length] = X
                }
            }

            function s(Y) {
                if (typeof O.addEventListener != D) {
                    O.addEventListener("load", Y, false)
                } else {
                    if (typeof j.addEventListener != D) {
                        j.addEventListener("load", Y, false)
                    } else {
                        if (typeof O.attachEvent != D) {
                            i(O, "onload", Y)
                        } else {
                            if (typeof O.onload == "function") {
                                var X = O.onload;
                                O.onload = function () {
                                    X();
                                    Y()
                                }
                            } else {
                                O.onload = Y
                            }
                        }
                    }
                }
            }

            function h() {
                if (T) {
                    V()
                } else {
                    H()
                }
            }

            function V() {
                var X = j.getElementsByTagName("body")[0];
                var aa = C(r);
                aa.setAttribute("type", q);
                var Z = X.appendChild(aa);
                if (Z) {
                    var Y = 0;
                    (function () {
                        if (typeof Z.GetVariable != D) {
                            var ab = Z.GetVariable("$version");
                            if (ab) {
                                ab = ab.split(" ")[1].split(",");
                                M.pv = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                            }
                        } else {
                            if (Y < 10) {
                                Y++;
                                setTimeout(arguments.callee, 10);
                                return
                            }
                        }
                        X.removeChild(aa);
                        Z = null;
                        H()
                    })()
                } else {
                    H()
                }
            }

            function H() {
                var ag = o.length;
                if (ag > 0) {
                    for (var af = 0; af < ag; af++) {
                        var Y = o[af].id;
                        var ab = o[af].callbackFn;
                        var aa = {success: false, id: Y};
                        if (M.pv[0] > 0) {
                            var ae = c(Y);
                            if (ae) {
                                if (F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
                                    w(Y, true);
                                    if (ab) {
                                        aa.success = true;
                                        aa.ref = z(Y);
                                        ab(aa)
                                    }
                                } else {
                                    if (o[af].expressInstall && A()) {
                                        var ai = {};
                                        ai.data = o[af].expressInstall;
                                        ai.width = ae.getAttribute("width") || "0";
                                        ai.height = ae.getAttribute("height") || "0";
                                        if (ae.getAttribute("class")) {
                                            ai.styleclass = ae.getAttribute("class")
                                        }
                                        if (ae.getAttribute("align")) {
                                            ai.align = ae.getAttribute("align")
                                        }
                                        var ah = {};
                                        var X = ae.getElementsByTagName("param");
                                        var ac = X.length;
                                        for (var ad = 0; ad < ac; ad++) {
                                            if (X[ad].getAttribute("name").toLowerCase() != "movie") {
                                                ah[X[ad].getAttribute("name")] = X[ad].getAttribute("value")
                                            }
                                        }
                                        P(ai, ah, Y, ab)
                                    } else {
                                        p(ae);
                                        if (ab) {
                                            ab(aa)
                                        }
                                    }
                                }
                            }
                        } else {
                            w(Y, true);
                            if (ab) {
                                var Z = z(Y);
                                if (Z && typeof Z.SetVariable != D) {
                                    aa.success = true;
                                    aa.ref = Z
                                }
                                ab(aa)
                            }
                        }
                    }
                }
            }

            function z(aa) {
                var X = null;
                var Y = c(aa);
                if (Y && Y.nodeName == "OBJECT") {
                    if (typeof Y.SetVariable != D) {
                        X = Y
                    } else {
                        var Z = Y.getElementsByTagName(r)[0];
                        if (Z) {
                            X = Z
                        }
                    }
                }
                return X
            }

            function A() {
                return !a && F("6.0.65") && (M.win || M.mac) && !(M.wk && M.wk < 312)
            }

            function P(aa, ab, X, Z) {
                a = true;
                E = Z || null;
                B = {success: false, id: X};
                var ae = c(X);
                if (ae) {
                    if (ae.nodeName == "OBJECT") {
                        l = g(ae);
                        Q = null
                    } else {
                        l = ae;
                        Q = X
                    }
                    aa.id = R;
                    if (typeof aa.width == D || (!/%$/.test(aa.width) && parseInt(aa.width, 10) < 310)) {
                        aa.width = "310"
                    }
                    if (typeof aa.height == D || (!/%$/.test(aa.height) && parseInt(aa.height, 10) < 137)) {
                        aa.height = "137"
                    }
                    j.title = j.title.slice(0, 47) + " - Flash Player Installation";
                    var ad = M.ie && M.win ? (['Active'].concat('').join('X')) : "PlugIn", ac = "MMredirectURL=" + O.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + ad + "&MMdoctitle=" + j.title;
                    if (typeof ab.flashvars != D) {
                        ab.flashvars += "&" + ac
                    } else {
                        ab.flashvars = ac
                    }
                    if (M.ie && M.win && ae.readyState != 4) {
                        var Y = C("div");
                        X += "SWFObjectNew";
                        Y.setAttribute("id", X);
                        ae.parentNode.insertBefore(Y, ae);
                        ae.style.display = "none";
                        (function () {
                            if (ae.readyState == 4) {
                                ae.parentNode.removeChild(ae)
                            } else {
                                setTimeout(arguments.callee, 10)
                            }
                        })()
                    }
                    u(aa, ab, X)
                }
            }

            function p(Y) {
                if (M.ie && M.win && Y.readyState != 4) {
                    var X = C("div");
                    Y.parentNode.insertBefore(X, Y);
                    X.parentNode.replaceChild(g(Y), X);
                    Y.style.display = "none";
                    (function () {
                        if (Y.readyState == 4) {
                            Y.parentNode.removeChild(Y)
                        } else {
                            setTimeout(arguments.callee, 10)
                        }
                    })()
                } else {
                    Y.parentNode.replaceChild(g(Y), Y)
                }
            }

            function g(ab) {
                var aa = C("div");
                if (M.win && M.ie) {
                    aa.innerHTML = ab.innerHTML
                } else {
                    var Y = ab.getElementsByTagName(r)[0];
                    if (Y) {
                        var ad = Y.childNodes;
                        if (ad) {
                            var X = ad.length;
                            for (var Z = 0; Z < X; Z++) {
                                if (!(ad[Z].nodeType == 1 && ad[Z].nodeName == "PARAM") && !(ad[Z].nodeType == 8)) {
                                    aa.appendChild(ad[Z].cloneNode(true))
                                }
                            }
                        }
                    }
                }
                return aa
            }

            function u(ai, ag, Y) {
                var X, aa = c(Y);
                if (M.wk && M.wk < 312) {
                    return X
                }
                if (aa) {
                    if (typeof ai.id == D) {
                        ai.id = Y
                    }
                    if (M.ie && M.win) {
                        var ah = "";
                        for (var ae in ai) {
                            if (ai[ae] != Object.prototype[ae]) {
                                if (ae.toLowerCase() == "data") {
                                    ag.movie = ai[ae]
                                } else {
                                    if (ae.toLowerCase() == "styleclass") {
                                        ah += ' class="' + ai[ae] + '"'
                                    } else {
                                        if (ae.toLowerCase() != "classid") {
                                            ah += " " + ae + '="' + ai[ae] + '"'
                                        }
                                    }
                                }
                            }
                        }
                        var af = "";
                        for (var ad in ag) {
                            if (ag[ad] != Object.prototype[ad]) {
                                af += '<param name="' + ad + '" value="' + ag[ad] + '" />'
                            }
                        }
                        aa.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + ah + ">" + af + "</object>";
                        N[N.length] = ai.id;
                        X = c(ai.id)
                    } else {
                        var Z = C(r);
                        Z.setAttribute("type", q);
                        for (var ac in ai) {
                            if (ai[ac] != Object.prototype[ac]) {
                                if (ac.toLowerCase() == "styleclass") {
                                    Z.setAttribute("class", ai[ac])
                                } else {
                                    if (ac.toLowerCase() != "classid") {
                                        Z.setAttribute(ac, ai[ac])
                                    }
                                }
                            }
                        }
                        for (var ab in ag) {
                            if (ag[ab] != Object.prototype[ab] && ab.toLowerCase() != "movie") {
                                e(Z, ab, ag[ab])
                            }
                        }
                        aa.parentNode.replaceChild(Z, aa);
                        X = Z
                    }
                }
                return X
            }

            function e(Z, X, Y) {
                var aa = C("param");
                aa.setAttribute("name", X);
                aa.setAttribute("value", Y);
                Z.appendChild(aa)
            }

            function y(Y) {
                var X = c(Y);
                if (X && X.nodeName == "OBJECT") {
                    if (M.ie && M.win) {
                        X.style.display = "none";
                        (function () {
                            if (X.readyState == 4) {
                                b(Y)
                            } else {
                                setTimeout(arguments.callee, 10)
                            }
                        })()
                    } else {
                        X.parentNode.removeChild(X)
                    }
                }
            }

            function b(Z) {
                var Y = c(Z);
                if (Y) {
                    for (var X in Y) {
                        if (typeof Y[X] == "function") {
                            Y[X] = null
                        }
                    }
                    Y.parentNode.removeChild(Y)
                }
            }

            function c(Z) {
                var X = null;
                try {
                    X = j.getElementById(Z)
                } catch (Y) {
                }
                return X
            }

            function C(X) {
                return j.createElement(X)
            }

            function i(Z, X, Y) {
                Z.attachEvent(X, Y);
                I[I.length] = [Z, X, Y]
            }

            function F(Z) {
                var Y = M.pv, X = Z.split(".");
                X[0] = parseInt(X[0], 10);
                X[1] = parseInt(X[1], 10) || 0;
                X[2] = parseInt(X[2], 10) || 0;
                return(Y[0] > X[0] || (Y[0] == X[0] && Y[1] > X[1]) || (Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2])) ? true : false
            }

            function v(ac, Y, ad, ab) {
                if (M.ie && M.mac) {
                    return
                }
                var aa = j.getElementsByTagName("head")[0];
                if (!aa) {
                    return
                }
                var X = (ad && typeof ad == "string") ? ad : "screen";
                if (ab) {
                    n = null;
                    G = null
                }
                if (!n || G != X) {
                    var Z = C("style");
                    Z.setAttribute("type", "text/css");
                    Z.setAttribute("media", X);
                    n = aa.appendChild(Z);
                    if (M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
                        n = j.styleSheets[j.styleSheets.length - 1]
                    }
                    G = X
                }
                if (M.ie && M.win) {
                    if (n && typeof n.addRule == r) {
                        n.addRule(ac, Y)
                    }
                } else {
                    if (n && typeof j.createTextNode != D) {
                        n.appendChild(j.createTextNode(ac + " {" + Y + "}"))
                    }
                }
            }

            function w(Z, X) {
                if (!m) {
                    return
                }
                var Y = X ? "visible" : "hidden";
                if (J && c(Z)) {
                    c(Z).style.visibility = Y
                } else {
                    v("#" + Z, "visibility:" + Y)
                }
            }

            function L(Y) {
                var Z = /[\\\"<>\.;]/;
                var X = Z.exec(Y) != null;
                return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y
            }

            var d = function () {
                if (M.ie && M.win) {
                    window.attachEvent("onunload", function () {
                        var ac = I.length;
                        for (var ab = 0; ab < ac; ab++) {
                            I[ab][0].detachEvent(I[ab][1], I[ab][2])
                        }
                        var Z = N.length;
                        for (var aa = 0; aa < Z; aa++) {
                            y(N[aa])
                        }
                        for (var Y in M) {
                            M[Y] = null
                        }
                        M = null;
                        for (var X in swfobject) {
                            swfobject[X] = null
                        }
                        swfobject = null
                    })
                }
            }();
            return{registerObject: function (ab, X, aa, Z) {
                if (M.w3 && ab && X) {
                    var Y = {};
                    Y.id = ab;
                    Y.swfVersion = X;
                    Y.expressInstall = aa;
                    Y.callbackFn = Z;
                    o[o.length] = Y;
                    w(ab, false)
                } else {
                    if (Z) {
                        Z({success: false, id: ab})
                    }
                }
            }, getObjectById: function (X) {
                if (M.w3) {
                    return z(X)
                }
            }, embedSWF: function (ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
                var X = {success: false, id: ah};
                if (M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
                    w(ah, false);
                    K(function () {
                        ae += "";
                        ag += "";
                        var aj = {};
                        if (af && typeof af === r) {
                            for (var al in af) {
                                aj[al] = af[al]
                            }
                        }
                        aj.data = ab;
                        aj.width = ae;
                        aj.height = ag;
                        var am = {};
                        if (ad && typeof ad === r) {
                            for (var ak in ad) {
                                am[ak] = ad[ak]
                            }
                        }
                        if (Z && typeof Z === r) {
                            for (var ai in Z) {
                                if (typeof am.flashvars != D) {
                                    am.flashvars += "&" + ai + "=" + Z[ai]
                                } else {
                                    am.flashvars = ai + "=" + Z[ai]
                                }
                            }
                        }
                        if (F(Y)) {
                            var an = u(aj, am, ah);
                            if (aj.id == ah) {
                                w(ah, true)
                            }
                            X.success = true;
                            X.ref = an
                        } else {
                            if (aa && A()) {
                                aj.data = aa;
                                P(aj, am, ah, ac);
                                return
                            } else {
                                w(ah, true)
                            }
                        }
                        if (ac) {
                            ac(X)
                        }
                    })
                } else {
                    if (ac) {
                        ac(X)
                    }
                }
            }, switchOffAutoHideShow: function () {
                m = false
            }, ua: M, getFlashPlayerVersion: function () {
                return{major: M.pv[0], minor: M.pv[1], release: M.pv[2]}
            }, hasFlashPlayerVersion: F, createSWF: function (Z, Y, X) {
                if (M.w3) {
                    return u(Z, Y, X)
                } else {
                    return undefined
                }
            }, showExpressInstall: function (Z, aa, X, Y) {
                if (M.w3 && A()) {
                    P(Z, aa, X, Y)
                }
            }, removeSWF: function (X) {
                if (M.w3) {
                    y(X)
                }
            }, createCSS: function (aa, Z, Y, X) {
                if (M.w3) {
                    v(aa, Z, Y, X)
                }
            }, addDomLoadEvent: K, addLoadEvent: s, getQueryParamValue: function (aa) {
                var Z = j.location.search || j.location.hash;
                if (Z) {
                    if (/\?/.test(Z)) {
                        Z = Z.split("?")[1]
                    }
                    if (aa == null) {
                        return L(Z)
                    }
                    var Y = Z.split("&");
                    for (var X = 0; X < Y.length; X++) {
                        if (Y[X].substring(0, Y[X].indexOf("=")) == aa) {
                            return L(Y[X].substring((Y[X].indexOf("=") + 1)))
                        }
                    }
                }
                return""
            }, expressInstallCallback: function () {
                if (a) {
                    var X = c(R);
                    if (X && l) {
                        X.parentNode.replaceChild(l, X);
                        if (Q) {
                            w(Q, true);
                            if (M.ie && M.win) {
                                l.style.display = "block"
                            }
                        }
                        if (E) {
                            E(B)
                        }
                    }
                    a = false
                }
            }}
        }();
    }
// Copyright: Hiroshi Ichikawa <http://gimite.net/en/>
// License: New BSD License
// Reference: http://dev.w3.org/html5/websockets/
// Reference: http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol

    (function () {

        if ('undefined' == typeof window || window.WebSocket) return;

        var console = window.console;
        if (!console || !console.log || !console.error) {
            console = {log: function () {
            }, error: function () {
            }};
        }

        if (!swfobject.hasFlashPlayerVersion("10.0.0")) {
            console.error("Flash Player >= 10.0.0 is required.");
            return;
        }
        if (location.protocol == "file:") {
            console.error(
                "WARNING: web-socket-js doesn't work in file:///... URL " +
                    "unless you set Flash Security Settings properly. " +
                    "Open the page via Web server i.e. http://...");
        }

        /**
         * This class represents a faux web socket.
         * @param {string} url
         * @param {array or string} protocols
         * @param {string} proxyHost
         * @param {int} proxyPort
         * @param {string} headers
         */
        WebSocket = function (url, protocols, proxyHost, proxyPort, headers) {
            var self = this;
            self.__id = WebSocket.__nextId++;
            WebSocket.__instances[self.__id] = self;
            self.readyState = WebSocket.CONNECTING;
            self.bufferedAmount = 0;
            self.__events = {};
            if (!protocols) {
                protocols = [];
            } else if (typeof protocols == "string") {
                protocols = [protocols];
            }
            // Uses setTimeout() to make sure __createFlash() runs after the caller sets ws.onopen etc.
            // Otherwise, when onopen fires immediately, onopen is called before it is set.
            setTimeout(function () {
                WebSocket.__addTask(function () {
                    WebSocket.__flash.create(
                        self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null);
                });
            }, 0);
        };

        /**
         * Send data to the web socket.
         * @param {string} data  The data to send to the socket.
         * @return {boolean}  True for success, false for failure.
         */
        WebSocket.prototype.send = function (data) {
            if (this.readyState == WebSocket.CONNECTING) {
                throw "INVALID_STATE_ERR: Web Socket connection has not been established";
            }
            // We use encodeURIComponent() here, because FABridge doesn't work if
            // the argument includes some characters. We don't use escape() here
            // because of this:
            // https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Functions#escape_and_unescape_Functions
            // But it looks decodeURIComponent(encodeURIComponent(s)) doesn't
            // preserve all Unicode characters either e.g. "\uffff" in Firefox.
            // Note by wtritch: Hopefully this will not be necessary using ExternalInterface.  Will require
            // additional testing.
            var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
            if (result < 0) { // success
                return true;
            } else {
                this.bufferedAmount += result;
                return false;
            }
        };

        /**
         * Close this web socket gracefully.
         */
        WebSocket.prototype.close = function () {
            if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
                return;
            }
            this.readyState = WebSocket.CLOSING;
            WebSocket.__flash.close(this.__id);
        };

        /**
         * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
         *
         * @param {string} type
         * @param {function} listener
         * @param {boolean} useCapture
         * @return void
         */
        WebSocket.prototype.addEventListener = function (type, listener, useCapture) {
            if (!(type in this.__events)) {
                this.__events[type] = [];
            }
            this.__events[type].push(listener);
        };

        /**
         * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
         *
         * @param {string} type
         * @param {function} listener
         * @param {boolean} useCapture
         * @return void
         */
        WebSocket.prototype.removeEventListener = function (type, listener, useCapture) {
            if (!(type in this.__events)) return;
            var events = this.__events[type];
            for (var i = events.length - 1; i >= 0; --i) {
                if (events[i] === listener) {
                    events.splice(i, 1);
                    break;
                }
            }
        };

        /**
         * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
         *
         * @param {Event} event
         * @return void
         */
        WebSocket.prototype.dispatchEvent = function (event) {
            var events = this.__events[event.type] || [];
            for (var i = 0; i < events.length; ++i) {
                events[i](event);
            }
            var handler = this["on" + event.type];
            if (handler) handler(event);
        };

        /**
         * Handles an event from Flash.
         * @param {Object} flashEvent
         */
        WebSocket.prototype.__handleEvent = function (flashEvent) {
            if ("readyState" in flashEvent) {
                this.readyState = flashEvent.readyState;
            }
            if ("protocol" in flashEvent) {
                this.protocol = flashEvent.protocol;
            }

            var jsEvent;
            if (flashEvent.type == "open" || flashEvent.type == "error") {
                jsEvent = this.__createSimpleEvent(flashEvent.type);
            } else if (flashEvent.type == "close") {
                // TODO implement jsEvent.wasClean
                jsEvent = this.__createSimpleEvent("close");
            } else if (flashEvent.type == "message") {
                var data = decodeURIComponent(flashEvent.message);
                jsEvent = this.__createMessageEvent("message", data);
            } else {
                throw "unknown event type: " + flashEvent.type;
            }

            this.dispatchEvent(jsEvent);
        };

        WebSocket.prototype.__createSimpleEvent = function (type) {
            if (document.createEvent && window.Event) {
                var event = document.createEvent("Event");
                event.initEvent(type, false, false);
                return event;
            } else {
                return {type: type, bubbles: false, cancelable: false};
            }
        };

        WebSocket.prototype.__createMessageEvent = function (type, data) {
            if (document.createEvent && window.MessageEvent && !window.opera) {
                var event = document.createEvent("MessageEvent");
                event.initMessageEvent("message", false, false, data, null, null, window, null);
                return event;
            } else {
                // IE and Opera, the latter one truncates the data parameter after any 0x00 bytes.
                return {type: type, data: data, bubbles: false, cancelable: false};
            }
        };

        /**
         * Define the WebSocket readyState enumeration.
         */
        WebSocket.CONNECTING = 0;
        WebSocket.OPEN = 1;
        WebSocket.CLOSING = 2;
        WebSocket.CLOSED = 3;

        WebSocket.__flash = null;
        WebSocket.__instances = {};
        WebSocket.__tasks = [];
        WebSocket.__nextId = 0;

        /**
         * Load a new flash security policy file.
         * @param {string} url
         */
        WebSocket.loadFlashPolicyFile = function (url) {
            WebSocket.__addTask(function () {
                WebSocket.__flash.loadManualPolicyFile(url);
            });
        };

        /**
         * Loads WebSocketMain.swf and creates WebSocketMain object in Flash.
         */
        WebSocket.__initialize = function () {
            if (WebSocket.__flash) return;

            if (WebSocket.__swfLocation) {
                // For backword compatibility.
                window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation;
            }
            if (!window.WEB_SOCKET_SWF_LOCATION) {
                console.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");
                return;
            }
            var container = document.createElement("div");
            container.id = "webSocketContainer";
            // Hides Flash box. We cannot use display: none or visibility: hidden because it prevents
            // Flash from loading at least in IE. So we move it out of the screen at (-100, -100).
            // But this even doesn't work with Flash Lite (e.g. in Droid Incredible). So with Flash
            // Lite, we put it at (0, 0). This shows 1x1 box visible at left-top corner but this is
            // the best we can do as far as we know now.
            container.style.position = "absolute";
            if (WebSocket.__isFlashLite()) {
                container.style.left = "0px";
                container.style.top = "0px";
            } else {
                container.style.left = "-100px";
                container.style.top = "-100px";
            }
            var holder = document.createElement("div");
            holder.id = "webSocketFlash";
            container.appendChild(holder);
            document.body.appendChild(container);
            // See this article for hasPriority:
            // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
            swfobject.embedSWF(
                WEB_SOCKET_SWF_LOCATION,
                "webSocketFlash",
                "1" /* width */,
                "1" /* height */,
                "10.0.0" /* SWF version */,
                null,
                null,
                {hasPriority: true, swliveconnect: true, allowScriptAccess: "always"},
                null,
                function (e) {
                    if (!e.success) {
                        console.error("[WebSocket] swfobject.embedSWF failed");
                    }
                });
        };

        /**
         * Called by Flash to notify JS that it's fully loaded and ready
         * for communication.
         */
        WebSocket.__onFlashInitialized = function () {
            // We need to set a timeout here to avoid round-trip calls
            // to flash during the initialization process.
            setTimeout(function () {
                WebSocket.__flash = document.getElementById("webSocketFlash");
                WebSocket.__flash.setCallerUrl(location.href);
                WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);
                for (var i = 0; i < WebSocket.__tasks.length; ++i) {
                    WebSocket.__tasks[i]();
                }
                WebSocket.__tasks = [];
            }, 0);
        };

        /**
         * Called by Flash to notify WebSockets events are fired.
         */
        WebSocket.__onFlashEvent = function () {
            setTimeout(function () {
                try {
                    // Gets events using receiveEvents() instead of getting it from event object
                    // of Flash event. This is to make sure to keep message order.
                    // It seems sometimes Flash events don't arrive in the same order as they are sent.
                    var events = WebSocket.__flash.receiveEvents();
                    for (var i = 0; i < events.length; ++i) {
                        WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);
                    }
                } catch (e) {
                    console.error(e);
                }
            }, 0);
            return true;
        };

        // Called by Flash.
        WebSocket.__log = function (message) {
            console.log(decodeURIComponent(message));
        };

        // Called by Flash.
        WebSocket.__error = function (message) {
            console.error(decodeURIComponent(message));
        };

        WebSocket.__addTask = function (task) {
            if (WebSocket.__flash) {
                task();
            } else {
                WebSocket.__tasks.push(task);
            }
        };

        /**
         * Test if the browser is running flash lite.
         * @return {boolean} True if flash lite is running, false otherwise.
         */
        WebSocket.__isFlashLite = function () {
            if (!window.navigator || !window.navigator.mimeTypes) {
                return false;
            }
            var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
            if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
                return false;
            }
            return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false;
        };

        if (!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION) {
            if (window.addEventListener) {
                window.addEventListener("load", function () {
                    WebSocket.__initialize();
                }, false);
            } else {
                window.attachEvent("onload", function () {
                    WebSocket.__initialize();
                });
            }
        }

    })();

    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io, global) {

        /**
         * Expose constructor.
         *
         * @api public
         */

        exports.XHR = XHR;

        /**
         * XHR constructor
         *
         * @costructor
         * @api public
         */

        function XHR(socket) {
            if (!socket) return;

            io.Transport.apply(this, arguments);
            this.sendBuffer = [];
        };

        /**
         * Inherits from Transport.
         */

        io.util.inherit(XHR, io.Transport);

        /**
         * Establish a connection
         *
         * @returns {Transport}
         * @api public
         */

        XHR.prototype.open = function () {
            this.socket.setBuffer(false);
            this.onOpen();
            this.get();

            // we need to make sure the request succeeds since we have no indication
            // whether the request opened or not until it succeeded.
            this.setCloseTimeout();

            return this;
        };

        /**
         * Check if we need to send data to the Socket.IO server, if we have data in our
         * buffer we encode it and forward it to the `post` method.
         *
         * @api private
         */

        XHR.prototype.payload = function (payload) {
            var msgs = [];

            for (var i = 0, l = payload.length; i < l; i++) {
                msgs.push(io.parser.encodePacket(payload[i]));
            }

            this.send(io.parser.encodePayload(msgs));
        };

        /**
         * Send data to the Socket.IO server.
         *
         * @param data The message
         * @returns {Transport}
         * @api public
         */

        XHR.prototype.send = function (data) {
            this.post(data);
            return this;
        };

        /**
         * Posts a encoded message to the Socket.IO server.
         *
         * @param {String} data A encoded message.
         * @api private
         */

        function empty() {
        };

        XHR.prototype.post = function (data) {
            var self = this;
            this.socket.setBuffer(true);

            function stateChange() {
                if (this.readyState == 4) {
                    this.onreadystatechange = empty;
                    self.posting = false;

                    if (this.status == 200) {
                        self.socket.setBuffer(false);
                    } else {
                        self.onClose();
                    }
                }
            }

            function onload() {
                this.onload = empty;
                self.socket.setBuffer(false);
            };

            this.sendXHR = this.request('POST');

            if (global.XDomainRequest && this.sendXHR instanceof XDomainRequest) {
                this.sendXHR.onload = this.sendXHR.onerror = onload;
            } else {
                this.sendXHR.onreadystatechange = stateChange;
            }

            this.sendXHR.send(data);
        };

        /**
         * Disconnects the established `XHR` connection.
         *
         * @returns {Transport}
         * @api public
         */

        XHR.prototype.close = function () {
            this.onClose();
            return this;
        };

        /**
         * Generates a configured XHR request
         *
         * @param {String} url The url that needs to be requested.
         * @param {String} method The method the request should use.
         * @returns {XMLHttpRequest}
         * @api private
         */

        XHR.prototype.request = function (method) {
            var req = io.util.request(this.socket.isXDomain())
                , query = io.util.query(this.socket.options.query, 't=' + +new Date);

            req.open(method || 'GET', this.prepareUrl() + query, true);

            if (method == 'POST') {
                try {
                    if (req.setRequestHeader) {
                        req.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
                    } else {
                        // XDomainRequest
                        req.contentType = 'text/plain';
                    }
                } catch (e) {
                }
            }

            return req;
        };

        /**
         * Returns the scheme to use for the transport URLs.
         *
         * @api private
         */

        XHR.prototype.scheme = function () {
            return this.socket.options.secure ? 'https' : 'http';
        };

        /**
         * Check if the XHR transports are supported
         *
         * @param {Boolean} xdomain Check if we support cross domain requests.
         * @returns {Boolean}
         * @api public
         */

        XHR.check = function (socket, xdomain) {
            try {
                var request = io.util.request(xdomain),
                    usesXDomReq = (global.XDomainRequest && request instanceof XDomainRequest),
                    socketProtocol = (socket && socket.options && socket.options.secure ? 'https:' : 'http:'),
                    isXProtocol = (global.location && socketProtocol != global.location.protocol);
                if (request && !(usesXDomReq && isXProtocol)) {
                    return true;
                }
            } catch (e) {
            }

            return false;
        };

        /**
         * Check if the XHR transport supports cross domain requests.
         *
         * @returns {Boolean}
         * @api public
         */

        XHR.xdomainCheck = function (socket) {
            return XHR.check(socket, true);
        };

    })(
            'undefined' != typeof io ? io.Transport : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
            , this
        );
    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io) {

        /**
         * Expose constructor.
         */

        exports.htmlfile = HTMLFile;

        /**
         * The HTMLFile transport creates a `forever iframe` based transport
         * for Internet Explorer. Regular forever iframe implementations will
         * continuously trigger the browsers buzy indicators. If the forever iframe
         * is created inside a `htmlfile` these indicators will not be trigged.
         *
         * @constructor
         * @extends {io.Transport.XHR}
         * @api public
         */

        function HTMLFile(socket) {
            io.Transport.XHR.apply(this, arguments);
        };

        /**
         * Inherits from XHR transport.
         */

        io.util.inherit(HTMLFile, io.Transport.XHR);

        /**
         * Transport name
         *
         * @api public
         */

        HTMLFile.prototype.name = 'htmlfile';

        /**
         * Creates a new Ac...eX `htmlfile` with a forever loading iframe
         * that can be used to listen to messages. Inside the generated
         * `htmlfile` a reference will be made to the HTMLFile transport.
         *
         * @api private
         */

        HTMLFile.prototype.get = function () {
            this.doc = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
            this.doc.open();
            this.doc.write('<html></html>');
            this.doc.close();
            this.doc.parentWindow.s = this;

            var iframeC = this.doc.createElement('div');
            iframeC.className = 'socketio';

            this.doc.body.appendChild(iframeC);
            this.iframe = this.doc.createElement('iframe');

            iframeC.appendChild(this.iframe);

            var self = this
                , query = io.util.query(this.socket.options.query, 't=' + +new Date);

            this.iframe.src = this.prepareUrl() + query;

            io.util.on(window, 'unload', function () {
                self.destroy();
            });
        };

        /**
         * The Socket.IO server will write script tags inside the forever
         * iframe, this function will be used as callback for the incoming
         * information.
         *
         * @param {String} data The message
         * @param {document} doc Reference to the context
         * @api private
         */

        HTMLFile.prototype._ = function (data, doc) {
            // unescape all forward slashes. see GH-1251
            data = data.replace(/\\\//g, '/');
            this.onData(data);
            try {
                var script = doc.getElementsByTagName('script')[0];
                script.parentNode.removeChild(script);
            } catch (e) {
            }
        };

        /**
         * Destroy the established connection, iframe and `htmlfile`.
         * And calls the `CollectGarbage` function of Internet Explorer
         * to release the memory.
         *
         * @api private
         */

        HTMLFile.prototype.destroy = function () {
            if (this.iframe) {
                try {
                    this.iframe.src = 'about:blank';
                } catch (e) {
                }

                this.doc = null;
                this.iframe.parentNode.removeChild(this.iframe);
                this.iframe = null;

                CollectGarbage();
            }
        };

        /**
         * Disconnects the established connection.
         *
         * @returns {Transport} Chaining.
         * @api public
         */

        HTMLFile.prototype.close = function () {
            this.destroy();
            return io.Transport.XHR.prototype.close.call(this);
        };

        /**
         * Checks if the browser supports this transport. The browser
         * must have an `Ac...eXObject` implementation.
         *
         * @return {Boolean}
         * @api public
         */

        HTMLFile.check = function (socket) {
            if (typeof window != "undefined" && (['Active'].concat('Object').join('X')) in window) {
                try {
                    var a = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
                    return a && io.Transport.XHR.check(socket);
                } catch (e) {
                }
            }
            return false;
        };

        /**
         * Check if cross domain requests are supported.
         *
         * @returns {Boolean}
         * @api public
         */

        HTMLFile.xdomainCheck = function () {
            // we can probably do handling for sub-domains, we should
            // test that it's cross domain but a subdomain here
            return false;
        };

        /**
         * Add the transport to your public io.transports array.
         *
         * @api private
         */

        io.transports.push('htmlfile');

    })(
            'undefined' != typeof io ? io.Transport : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
        );

    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io, global) {

        /**
         * Expose constructor.
         */

        exports['xhr-polling'] = XHRPolling;

        /**
         * The XHR-polling transport uses long polling XHR requests to create a
         * "persistent" connection with the server.
         *
         * @constructor
         * @api public
         */

        function XHRPolling() {
            io.Transport.XHR.apply(this, arguments);
        };

        /**
         * Inherits from XHR transport.
         */

        io.util.inherit(XHRPolling, io.Transport.XHR);

        /**
         * Merge the properties from XHR transport
         */

        io.util.merge(XHRPolling, io.Transport.XHR);

        /**
         * Transport name
         *
         * @api public
         */

        XHRPolling.prototype.name = 'xhr-polling';

        /**
         * Indicates whether heartbeats is enabled for this transport
         *
         * @api private
         */

        XHRPolling.prototype.heartbeats = function () {
            return false;
        };

        /**
         * Establish a connection, for iPhone and Android this will be done once the page
         * is loaded.
         *
         * @returns {Transport} Chaining.
         * @api public
         */

        XHRPolling.prototype.open = function () {
            var self = this;

            io.Transport.XHR.prototype.open.call(self);
            return false;
        };

        /**
         * Starts a XHR request to wait for incoming messages.
         *
         * @api private
         */

        function empty() {
        };

        XHRPolling.prototype.get = function () {
            if (!this.isOpen) return;

            var self = this;

            function stateChange() {
                if (this.readyState == 4) {
                    this.onreadystatechange = empty;

                    if (this.status == 200) {
                        self.onData(this.responseText);
                        self.get();
                    } else {
                        self.onClose();
                    }
                }
            };

            function onload() {
                this.onload = empty;
                this.onerror = empty;
                self.retryCounter = 1;
                self.onData(this.responseText);
                self.get();
            };

            function onerror() {
                self.retryCounter++;
                if (!self.retryCounter || self.retryCounter > 3) {
                    self.onClose();
                } else {
                    self.get();
                }
            };

            this.xhr = this.request();

            if (global.XDomainRequest && this.xhr instanceof XDomainRequest) {
                this.xhr.onload = onload;
                this.xhr.onerror = onerror;
            } else {
                this.xhr.onreadystatechange = stateChange;
            }

            this.xhr.send(null);
        };

        /**
         * Handle the unclean close behavior.
         *
         * @api private
         */

        XHRPolling.prototype.onClose = function () {
            io.Transport.XHR.prototype.onClose.call(this);

            if (this.xhr) {
                this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = empty;
                try {
                    this.xhr.abort();
                } catch (e) {
                }
                this.xhr = null;
            }
        };

        /**
         * Webkit based browsers show a infinit spinner when you start a XHR request
         * before the browsers onload event is called so we need to defer opening of
         * the transport until the onload event is called. Wrapping the cb in our
         * defer method solve this.
         *
         * @param {Socket} socket The socket instance that needs a transport
         * @param {Function} fn The callback
         * @api private
         */

        XHRPolling.prototype.ready = function (socket, fn) {
            var self = this;

            io.util.defer(function () {
                fn.call(self);
            });
        };

        /**
         * Add the transport to your public io.transports array.
         *
         * @api private
         */

        io.transports.push('xhr-polling');

    })(
            'undefined' != typeof io ? io.Transport : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
            , this
        );

    /**
     * socket.io
     * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
     * MIT Licensed
     */

    (function (exports, io, global) {
        /**
         * There is a way to hide the loading indicator in Firefox. If you create and
         * remove a iframe it will stop showing the current loading indicator.
         * Unfortunately we can't feature detect that and UA sniffing is evil.
         *
         * @api private
         */

        var indicator = global.document && "MozAppearance" in
            global.document.documentElement.style;

        /**
         * Expose constructor.
         */

        exports['jsonp-polling'] = JSONPPolling;

        /**
         * The JSONP transport creates an persistent connection by dynamically
         * inserting a script tag in the page. This script tag will receive the
         * information of the Socket.IO server. When new information is received
         * it creates a new script tag for the new data stream.
         *
         * @constructor
         * @extends {io.Transport.xhr-polling}
         * @api public
         */

        function JSONPPolling(socket) {
            io.Transport['xhr-polling'].apply(this, arguments);

            this.index = io.j.length;

            var self = this;

            io.j.push(function (msg) {
                self._(msg);
            });
        };

        /**
         * Inherits from XHR polling transport.
         */

        io.util.inherit(JSONPPolling, io.Transport['xhr-polling']);

        /**
         * Transport name
         *
         * @api public
         */

        JSONPPolling.prototype.name = 'jsonp-polling';

        /**
         * Posts a encoded message to the Socket.IO server using an iframe.
         * The iframe is used because script tags can create POST based requests.
         * The iframe is positioned outside of the view so the user does not
         * notice it's existence.
         *
         * @param {String} data A encoded message.
         * @api private
         */

        JSONPPolling.prototype.post = function (data) {
            var self = this
                , query = io.util.query(
                    this.socket.options.query
                    , 't=' + (+new Date) + '&i=' + this.index
                );

            if (!this.form) {
                var form = document.createElement('form')
                    , area = document.createElement('textarea')
                    , id = this.iframeId = 'socketio_iframe_' + this.index
                    , iframe;

                form.className = 'socketio';
                form.style.position = 'absolute';
                form.style.top = '0px';
                form.style.left = '0px';
                form.style.display = 'none';
                form.target = id;
                form.method = 'POST';
                form.setAttribute('accept-charset', 'utf-8');
                area.name = 'd';
                form.appendChild(area);
                document.body.appendChild(form);

                this.form = form;
                this.area = area;
            }

            this.form.action = this.prepareUrl() + query;

            function complete() {
                initIframe();
                self.socket.setBuffer(false);
            };

            function initIframe() {
                if (self.iframe) {
                    self.form.removeChild(self.iframe);
                }

                try {
                    // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
                    iframe = document.createElement('<iframe name="' + self.iframeId + '">');
                } catch (e) {
                    iframe = document.createElement('iframe');
                    iframe.name = self.iframeId;
                }

                iframe.id = self.iframeId;

                self.form.appendChild(iframe);
                self.iframe = iframe;
            };

            initIframe();

            // we temporarily stringify until we figure out how to prevent
            // browsers from turning `\n` into `\r\n` in form inputs
            this.area.value = io.JSON.stringify(data);

            try {
                this.form.submit();
            } catch (e) {
            }

            if (this.iframe.attachEvent) {
                iframe.onreadystatechange = function () {
                    if (self.iframe.readyState == 'complete') {
                        complete();
                    }
                };
            } else {
                this.iframe.onload = complete;
            }

            this.socket.setBuffer(true);
        };

        /**
         * Creates a new JSONP poll that can be used to listen
         * for messages from the Socket.IO server.
         *
         * @api private
         */

        JSONPPolling.prototype.get = function () {
            var self = this
                , script = document.createElement('script')
                , query = io.util.query(
                    this.socket.options.query
                    , 't=' + (+new Date) + '&i=' + this.index
                );

            if (this.script) {
                this.script.parentNode.removeChild(this.script);
                this.script = null;
            }

            script.async = true;
            script.src = this.prepareUrl() + query;
            script.onerror = function () {
                self.onClose();
            };

            var insertAt = document.getElementsByTagName('script')[0];
            insertAt.parentNode.insertBefore(script, insertAt);
            this.script = script;

            if (indicator) {
                setTimeout(function () {
                    var iframe = document.createElement('iframe');
                    document.body.appendChild(iframe);
                    document.body.removeChild(iframe);
                }, 100);
            }
        };

        /**
         * Callback function for the incoming message stream from the Socket.IO server.
         *
         * @param {String} data The message
         * @api private
         */

        JSONPPolling.prototype._ = function (msg) {
            this.onData(msg);
            if (this.isOpen) {
                this.get();
            }
            return this;
        };

        /**
         * The indicator hack only works after onload
         *
         * @param {Socket} socket The socket instance that needs a transport
         * @param {Function} fn The callback
         * @api private
         */

        JSONPPolling.prototype.ready = function (socket, fn) {
            var self = this;
            if (!indicator) return fn.call(this);

            io.util.load(function () {
                fn.call(self);
            });
        };

        /**
         * Checks if browser supports this transport.
         *
         * @return {Boolean}
         * @api public
         */

        JSONPPolling.check = function () {
            return 'document' in global;
        };

        /**
         * Check if cross domain requests are supported
         *
         * @returns {Boolean}
         * @api public
         */

        JSONPPolling.xdomainCheck = function () {
            return true;
        };

        /**
         * Add the transport to your public io.transports array.
         *
         * @api private
         */

        io.transports.push('jsonp-polling');

    })(
            'undefined' != typeof io ? io.Transport : module.exports
            , 'undefined' != typeof io ? io : module.parent.exports
            , this
        );

    if (typeof define === "function" && define.amd) {
        define([], function () {
            return io;
        });
    }
})();
//画图组件. by jiangC
(function () {
    var draw = function (domId, options) {
        var myCanvas = document.createElement('canvas'),
            wrapper = document.getElementById(domId)
            ;

        myCanvas.style.width = getComputedStyle(wrapper).width;
        myCanvas.style.height = getComputedStyle(wrapper).height;

        this.canvas = myCanvas;
        this.canvas.width = parseInt(myCanvas.style.width);
        this.canvas.height = parseInt(myCanvas.style.height);

        this.context = this.canvas.getContext('2d');

        this.line = [
            {
                x: 0,
                y: 0
            }
        ]

        this.color = options.color || 'red';

        wrapper.appendChild(myCanvas);
    };

    draw.prototype.drawLine = function (xV, yV) {
        var len = this.line.length - 1;

        //解决clearRect失效的问题 http://stackoverflow.com/questions/9743027/clearrect-not-working
        this.context.beginPath();

        //old point.
        this.context.moveTo(this.line[len].x, this.line[len].y);

        //new point.
        this.context.lineTo(xV, yV);
        this.context.lineWidth = 1;
        this.context.strokeStyle = this.color;
        this.context.stroke();

        this.line.push({
            x: xV,
            y: yV
        });
    };

    draw.prototype.size = function () {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        }
    };

    draw.prototype.reset = function () {

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.line = [
            {
                x: 0,
                y: 0
            }
        ]
    }

    window.Draw = draw;
})();
/**
 * @fileoverview
 * - Using the 'QRCode for Javascript library'
 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
 * - this library has no dependencies.
 *
 * @author davidshimjs
 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
 */
var QRCode;

(function () {
    //---------------------------------------------------------------------
    // QRCode for JavaScript
    //
    // Copyright (c) 2009 Kazuhiko Arase
    //
    // URL: http://www.d-project.com/
    //
    // Licensed under the MIT license:
    //   http://www.opensource.org/licenses/mit-license.php
    //
    // The word "QR Code" is registered trademark of 
    // DENSO WAVE INCORPORATED
    //   http://www.denso-wave.com/qrcode/faqpatent-e.html
    //
    //---------------------------------------------------------------------
    function QR8bitByte(data) {
        this.mode = QRMode.MODE_8BIT_BYTE;
        this.data = data;
    }

    QR8bitByte.prototype = {getLength: function (buffer) {
        return this.data.length;
    }, write: function (buffer) {
        for (var i = 0; i < this.data.length; i++) {
            buffer.put(this.data.charCodeAt(i), 8);
        }
    }};
    function QRCodeModel(typeNumber, errorCorrectLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = errorCorrectLevel;
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];
    }

    QRCodeModel.prototype = {addData: function (data) {
        var newData = new QR8bitByte(data);
        this.dataList.push(newData);
        this.dataCache = null;
    }, isDark: function (row, col) {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
            throw new Error(row + "," + col);
        }
        return this.modules[row][col];
    }, getModuleCount: function () {
        return this.moduleCount;
    }, make: function () {
        this.makeImpl(false, this.getBestMaskPattern());
    }, makeImpl: function (test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = new Array(this.moduleCount);
        for (var row = 0; row < this.moduleCount; row++) {
            this.modules[row] = new Array(this.moduleCount);
            for (var col = 0; col < this.moduleCount; col++) {
                this.modules[row][col] = null;
            }
        }
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);
        if (this.typeNumber >= 7) {
            this.setupTypeNumber(test);
        }
        if (this.dataCache == null) {
            this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        }
        this.mapData(this.dataCache, maskPattern);
    }, setupPositionProbePattern: function (row, col) {
        for (var r = -1; r <= 7; r++) {
            if (row + r <= -1 || this.moduleCount <= row + r)continue;
            for (var c = -1; c <= 7; c++) {
                if (col + c <= -1 || this.moduleCount <= col + c)continue;
                if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                    this.modules[row + r][col + c] = true;
                } else {
                    this.modules[row + r][col + c] = false;
                }
            }
        }
    }, getBestMaskPattern: function () {
        var minLostPoint = 0;
        var pattern = 0;
        for (var i = 0; i < 8; i++) {
            this.makeImpl(true, i);
            var lostPoint = QRUtil.getLostPoint(this);
            if (i == 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
            }
        }
        return pattern;
    }, createMovieClip: function (target_mc, instance_name, depth) {
        var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
        var cs = 1;
        this.make();
        for (var row = 0; row < this.modules.length; row++) {
            var y = row * cs;
            for (var col = 0; col < this.modules[row].length; col++) {
                var x = col * cs;
                var dark = this.modules[row][col];
                if (dark) {
                    qr_mc.beginFill(0, 100);
                    qr_mc.moveTo(x, y);
                    qr_mc.lineTo(x + cs, y);
                    qr_mc.lineTo(x + cs, y + cs);
                    qr_mc.lineTo(x, y + cs);
                    qr_mc.endFill();
                }
            }
        }
        return qr_mc;
    }, setupTimingPattern: function () {
        for (var r = 8; r < this.moduleCount - 8; r++) {
            if (this.modules[r][6] != null) {
                continue;
            }
            this.modules[r][6] = (r % 2 == 0);
        }
        for (var c = 8; c < this.moduleCount - 8; c++) {
            if (this.modules[6][c] != null) {
                continue;
            }
            this.modules[6][c] = (c % 2 == 0);
        }
    }, setupPositionAdjustPattern: function () {
        var pos = QRUtil.getPatternPosition(this.typeNumber);
        for (var i = 0; i < pos.length; i++) {
            for (var j = 0; j < pos.length; j++) {
                var row = pos[i];
                var col = pos[j];
                if (this.modules[row][col] != null) {
                    continue;
                }
                for (var r = -2; r <= 2; r++) {
                    for (var c = -2; c <= 2; c++) {
                        if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                            this.modules[row + r][col + c] = true;
                        } else {
                            this.modules[row + r][col + c] = false;
                        }
                    }
                }
            }
        }
    }, setupTypeNumber: function (test) {
        var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        for (var i = 0; i < 18; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
        }
        for (var i = 0; i < 18; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
        }
    }, setupTypeInfo: function (test, maskPattern) {
        var data = (this.errorCorrectLevel << 3) | maskPattern;
        var bits = QRUtil.getBCHTypeInfo(data);
        for (var i = 0; i < 15; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            if (i < 6) {
                this.modules[i][8] = mod;
            } else if (i < 8) {
                this.modules[i + 1][8] = mod;
            } else {
                this.modules[this.moduleCount - 15 + i][8] = mod;
            }
        }
        for (var i = 0; i < 15; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            if (i < 8) {
                this.modules[8][this.moduleCount - i - 1] = mod;
            } else if (i < 9) {
                this.modules[8][15 - i - 1 + 1] = mod;
            } else {
                this.modules[8][15 - i - 1] = mod;
            }
        }
        this.modules[this.moduleCount - 8][8] = (!test);
    }, mapData: function (data, maskPattern) {
        var inc = -1;
        var row = this.moduleCount - 1;
        var bitIndex = 7;
        var byteIndex = 0;
        for (var col = this.moduleCount - 1; col > 0; col -= 2) {
            if (col == 6)col--;
            while (true) {
                for (var c = 0; c < 2; c++) {
                    if (this.modules[row][col - c] == null) {
                        var dark = false;
                        if (byteIndex < data.length) {
                            dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
                        }
                        var mask = QRUtil.getMask(maskPattern, row, col - c);
                        if (mask) {
                            dark = !dark;
                        }
                        this.modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex == -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                row += inc;
                if (row < 0 || this.moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }};
    QRCodeModel.PAD0 = 0xEC;
    QRCodeModel.PAD1 = 0x11;
    QRCodeModel.createData = function (typeNumber, errorCorrectLevel, dataList) {
        var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
        var buffer = new QRBitBuffer();
        for (var i = 0; i < dataList.length; i++) {
            var data = dataList[i];
            buffer.put(data.mode, 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
            data.write(buffer);
        }
        var totalDataCount = 0;
        for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
        }
        if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw new Error("code length overflow. ("
                + buffer.getLengthInBits()
                + ">"
                + totalDataCount * 8
                + ")");
        }
        if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
        }
        while (buffer.getLengthInBits() % 8 != 0) {
            buffer.putBit(false);
        }
        while (true) {
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(QRCodeModel.PAD0, 8);
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(QRCodeModel.PAD1, 8);
        }
        return QRCodeModel.createBytes(buffer, rsBlocks);
    };
    QRCodeModel.createBytes = function (buffer, rsBlocks) {
        var offset = 0;
        var maxDcCount = 0;
        var maxEcCount = 0;
        var dcdata = new Array(rsBlocks.length);
        var ecdata = new Array(rsBlocks.length);
        for (var r = 0; r < rsBlocks.length; r++) {
            var dcCount = rsBlocks[r].dataCount;
            var ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for (var i = 0; i < dcdata[r].length; i++) {
                dcdata[r][i] = 0xff & buffer.buffer[i + offset];
            }
            offset += dcCount;
            var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
            var modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (var i = 0; i < ecdata[r].length; i++) {
                var modIndex = i + modPoly.getLength() - ecdata[r].length;
                ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
            }
        }
        var totalCodeCount = 0;
        for (var i = 0; i < rsBlocks.length; i++) {
            totalCodeCount += rsBlocks[i].totalCount;
        }
        var data = new Array(totalCodeCount);
        var index = 0;
        for (var i = 0; i < maxDcCount; i++) {
            for (var r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) {
                    data[index++] = dcdata[r][i];
                }
            }
        }
        for (var i = 0; i < maxEcCount; i++) {
            for (var r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) {
                    data[index++] = ecdata[r][i];
                }
            }
        }
        return data;
    };
    var QRMode = {MODE_NUMBER: 1 << 0, MODE_ALPHA_NUM: 1 << 1, MODE_8BIT_BYTE: 1 << 2, MODE_KANJI: 1 << 3};
    var QRErrorCorrectLevel = {L: 1, M: 0, Q: 3, H: 2};
    var QRMaskPattern = {PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7};
    var QRUtil = {PATTERN_POSITION_TABLE: [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ], G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0), G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0), G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1), getBCHTypeInfo: function (data) {
        var d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15)));
        }
        return((data << 10) | d) ^ QRUtil.G15_MASK;
    }, getBCHTypeNumber: function (data) {
        var d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18)));
        }
        return(data << 12) | d;
    }, getBCHDigit: function (data) {
        var digit = 0;
        while (data != 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    }, getPatternPosition: function (typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    }, getMask: function (maskPattern, i, j) {
        switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
                return(i + j) % 2 == 0;
            case QRMaskPattern.PATTERN001:
                return i % 2 == 0;
            case QRMaskPattern.PATTERN010:
                return j % 3 == 0;
            case QRMaskPattern.PATTERN011:
                return(i + j) % 3 == 0;
            case QRMaskPattern.PATTERN100:
                return(Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
            case QRMaskPattern.PATTERN101:
                return(i * j) % 2 + (i * j) % 3 == 0;
            case QRMaskPattern.PATTERN110:
                return((i * j) % 2 + (i * j) % 3) % 2 == 0;
            case QRMaskPattern.PATTERN111:
                return((i * j) % 3 + (i + j) % 2) % 2 == 0;
            default:
                throw new Error("bad maskPattern:" + maskPattern);
        }
    }, getErrorCorrectPolynomial: function (errorCorrectLength) {
        var a = new QRPolynomial([1], 0);
        for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
        }
        return a;
    }, getLengthInBits: function (mode, type) {
        if (1 <= type && type < 10) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 10;
                case QRMode.MODE_ALPHA_NUM:
                    return 9;
                case QRMode.MODE_8BIT_BYTE:
                    return 8;
                case QRMode.MODE_KANJI:
                    return 8;
                default:
                    throw new Error("mode:" + mode);
            }
        } else if (type < 27) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 12;
                case QRMode.MODE_ALPHA_NUM:
                    return 11;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 10;
                default:
                    throw new Error("mode:" + mode);
            }
        } else if (type < 41) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 14;
                case QRMode.MODE_ALPHA_NUM:
                    return 13;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 12;
                default:
                    throw new Error("mode:" + mode);
            }
        } else {
            throw new Error("type:" + type);
        }
    }, getLostPoint: function (qrCode) {
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                var sameCount = 0;
                var dark = qrCode.isDark(row, col);
                for (var r = -1; r <= 1; r++) {
                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }
                    for (var c = -1; c <= 1; c++) {
                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }
                        if (r == 0 && c == 0) {
                            continue;
                        }
                        if (dark == qrCode.isDark(row + r, col + c)) {
                            sameCount++;
                        }
                    }
                }
                if (sameCount > 5) {
                    lostPoint += (3 + sameCount - 5);
                }
            }
        }
        for (var row = 0; row < moduleCount - 1; row++) {
            for (var col = 0; col < moduleCount - 1; col++) {
                var count = 0;
                if (qrCode.isDark(row, col))count++;
                if (qrCode.isDark(row + 1, col))count++;
                if (qrCode.isDark(row, col + 1))count++;
                if (qrCode.isDark(row + 1, col + 1))count++;
                if (count == 0 || count == 4) {
                    lostPoint += 3;
                }
            }
        }
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount - 6; col++) {
                if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
                    lostPoint += 40;
                }
            }
        }
        for (var col = 0; col < moduleCount; col++) {
            for (var row = 0; row < moduleCount - 6; row++) {
                if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
                    lostPoint += 40;
                }
            }
        }
        var darkCount = 0;
        for (var col = 0; col < moduleCount; col++) {
            for (var row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col)) {
                    darkCount++;
                }
            }
        }
        var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;
        return lostPoint;
    }};
    var QRMath = {glog: function (n) {
        if (n < 1) {
            throw new Error("glog(" + n + ")");
        }
        return QRMath.LOG_TABLE[n];
    }, gexp: function (n) {
        while (n < 0) {
            n += 255;
        }
        while (n >= 256) {
            n -= 255;
        }
        return QRMath.EXP_TABLE[n];
    }, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256)};
    for (var i = 0; i < 8; i++) {
        QRMath.EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i++) {
        QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i++) {
        QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
    }
    function QRPolynomial(num, shift) {
        if (num.length == undefined) {
            throw new Error(num.length + "/" + shift);
        }
        var offset = 0;
        while (offset < num.length && num[offset] == 0) {
            offset++;
        }
        this.num = new Array(num.length - offset + shift);
        for (var i = 0; i < num.length - offset; i++) {
            this.num[i] = num[i + offset];
        }
    }

    QRPolynomial.prototype = {get: function (index) {
        return this.num[index];
    }, getLength: function () {
        return this.num.length;
    }, multiply: function (e) {
        var num = new Array(this.getLength() + e.getLength() - 1);
        for (var i = 0; i < this.getLength(); i++) {
            for (var j = 0; j < e.getLength(); j++) {
                num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
            }
        }
        return new QRPolynomial(num, 0);
    }, mod: function (e) {
        if (this.getLength() - e.getLength() < 0) {
            return this;
        }
        var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
        var num = new Array(this.getLength());
        for (var i = 0; i < this.getLength(); i++) {
            num[i] = this.get(i);
        }
        for (var i = 0; i < e.getLength(); i++) {
            num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
        }
        return new QRPolynomial(num, 0).mod(e);
    }};
    function QRRSBlock(totalCount, dataCount) {
        this.totalCount = totalCount;
        this.dataCount = dataCount;
    }

    QRRSBlock.RS_BLOCK_TABLE = [
        [1, 26, 19],
        [1, 26, 16],
        [1, 26, 13],
        [1, 26, 9],
        [1, 44, 34],
        [1, 44, 28],
        [1, 44, 22],
        [1, 44, 16],
        [1, 70, 55],
        [1, 70, 44],
        [2, 35, 17],
        [2, 35, 13],
        [1, 100, 80],
        [2, 50, 32],
        [2, 50, 24],
        [4, 25, 9],
        [1, 134, 108],
        [2, 67, 43],
        [2, 33, 15, 2, 34, 16],
        [2, 33, 11, 2, 34, 12],
        [2, 86, 68],
        [4, 43, 27],
        [4, 43, 19],
        [4, 43, 15],
        [2, 98, 78],
        [4, 49, 31],
        [2, 32, 14, 4, 33, 15],
        [4, 39, 13, 1, 40, 14],
        [2, 121, 97],
        [2, 60, 38, 2, 61, 39],
        [4, 40, 18, 2, 41, 19],
        [4, 40, 14, 2, 41, 15],
        [2, 146, 116],
        [3, 58, 36, 2, 59, 37],
        [4, 36, 16, 4, 37, 17],
        [4, 36, 12, 4, 37, 13],
        [2, 86, 68, 2, 87, 69],
        [4, 69, 43, 1, 70, 44],
        [6, 43, 19, 2, 44, 20],
        [6, 43, 15, 2, 44, 16],
        [4, 101, 81],
        [1, 80, 50, 4, 81, 51],
        [4, 50, 22, 4, 51, 23],
        [3, 36, 12, 8, 37, 13],
        [2, 116, 92, 2, 117, 93],
        [6, 58, 36, 2, 59, 37],
        [4, 46, 20, 6, 47, 21],
        [7, 42, 14, 4, 43, 15],
        [4, 133, 107],
        [8, 59, 37, 1, 60, 38],
        [8, 44, 20, 4, 45, 21],
        [12, 33, 11, 4, 34, 12],
        [3, 145, 115, 1, 146, 116],
        [4, 64, 40, 5, 65, 41],
        [11, 36, 16, 5, 37, 17],
        [11, 36, 12, 5, 37, 13],
        [5, 109, 87, 1, 110, 88],
        [5, 65, 41, 5, 66, 42],
        [5, 54, 24, 7, 55, 25],
        [11, 36, 12],
        [5, 122, 98, 1, 123, 99],
        [7, 73, 45, 3, 74, 46],
        [15, 43, 19, 2, 44, 20],
        [3, 45, 15, 13, 46, 16],
        [1, 135, 107, 5, 136, 108],
        [10, 74, 46, 1, 75, 47],
        [1, 50, 22, 15, 51, 23],
        [2, 42, 14, 17, 43, 15],
        [5, 150, 120, 1, 151, 121],
        [9, 69, 43, 4, 70, 44],
        [17, 50, 22, 1, 51, 23],
        [2, 42, 14, 19, 43, 15],
        [3, 141, 113, 4, 142, 114],
        [3, 70, 44, 11, 71, 45],
        [17, 47, 21, 4, 48, 22],
        [9, 39, 13, 16, 40, 14],
        [3, 135, 107, 5, 136, 108],
        [3, 67, 41, 13, 68, 42],
        [15, 54, 24, 5, 55, 25],
        [15, 43, 15, 10, 44, 16],
        [4, 144, 116, 4, 145, 117],
        [17, 68, 42],
        [17, 50, 22, 6, 51, 23],
        [19, 46, 16, 6, 47, 17],
        [2, 139, 111, 7, 140, 112],
        [17, 74, 46],
        [7, 54, 24, 16, 55, 25],
        [34, 37, 13],
        [4, 151, 121, 5, 152, 122],
        [4, 75, 47, 14, 76, 48],
        [11, 54, 24, 14, 55, 25],
        [16, 45, 15, 14, 46, 16],
        [6, 147, 117, 4, 148, 118],
        [6, 73, 45, 14, 74, 46],
        [11, 54, 24, 16, 55, 25],
        [30, 46, 16, 2, 47, 17],
        [8, 132, 106, 4, 133, 107],
        [8, 75, 47, 13, 76, 48],
        [7, 54, 24, 22, 55, 25],
        [22, 45, 15, 13, 46, 16],
        [10, 142, 114, 2, 143, 115],
        [19, 74, 46, 4, 75, 47],
        [28, 50, 22, 6, 51, 23],
        [33, 46, 16, 4, 47, 17],
        [8, 152, 122, 4, 153, 123],
        [22, 73, 45, 3, 74, 46],
        [8, 53, 23, 26, 54, 24],
        [12, 45, 15, 28, 46, 16],
        [3, 147, 117, 10, 148, 118],
        [3, 73, 45, 23, 74, 46],
        [4, 54, 24, 31, 55, 25],
        [11, 45, 15, 31, 46, 16],
        [7, 146, 116, 7, 147, 117],
        [21, 73, 45, 7, 74, 46],
        [1, 53, 23, 37, 54, 24],
        [19, 45, 15, 26, 46, 16],
        [5, 145, 115, 10, 146, 116],
        [19, 75, 47, 10, 76, 48],
        [15, 54, 24, 25, 55, 25],
        [23, 45, 15, 25, 46, 16],
        [13, 145, 115, 3, 146, 116],
        [2, 74, 46, 29, 75, 47],
        [42, 54, 24, 1, 55, 25],
        [23, 45, 15, 28, 46, 16],
        [17, 145, 115],
        [10, 74, 46, 23, 75, 47],
        [10, 54, 24, 35, 55, 25],
        [19, 45, 15, 35, 46, 16],
        [17, 145, 115, 1, 146, 116],
        [14, 74, 46, 21, 75, 47],
        [29, 54, 24, 19, 55, 25],
        [11, 45, 15, 46, 46, 16],
        [13, 145, 115, 6, 146, 116],
        [14, 74, 46, 23, 75, 47],
        [44, 54, 24, 7, 55, 25],
        [59, 46, 16, 1, 47, 17],
        [12, 151, 121, 7, 152, 122],
        [12, 75, 47, 26, 76, 48],
        [39, 54, 24, 14, 55, 25],
        [22, 45, 15, 41, 46, 16],
        [6, 151, 121, 14, 152, 122],
        [6, 75, 47, 34, 76, 48],
        [46, 54, 24, 10, 55, 25],
        [2, 45, 15, 64, 46, 16],
        [17, 152, 122, 4, 153, 123],
        [29, 74, 46, 14, 75, 47],
        [49, 54, 24, 10, 55, 25],
        [24, 45, 15, 46, 46, 16],
        [4, 152, 122, 18, 153, 123],
        [13, 74, 46, 32, 75, 47],
        [48, 54, 24, 14, 55, 25],
        [42, 45, 15, 32, 46, 16],
        [20, 147, 117, 4, 148, 118],
        [40, 75, 47, 7, 76, 48],
        [43, 54, 24, 22, 55, 25],
        [10, 45, 15, 67, 46, 16],
        [19, 148, 118, 6, 149, 119],
        [18, 75, 47, 31, 76, 48],
        [34, 54, 24, 34, 55, 25],
        [20, 45, 15, 61, 46, 16]
    ];
    QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectLevel) {
        var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
        if (rsBlock == undefined) {
            throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
        }
        var length = rsBlock.length / 3;
        var list = [];
        for (var i = 0; i < length; i++) {
            var count = rsBlock[i * 3 + 0];
            var totalCount = rsBlock[i * 3 + 1];
            var dataCount = rsBlock[i * 3 + 2];
            for (var j = 0; j < count; j++) {
                list.push(new QRRSBlock(totalCount, dataCount));
            }
        }
        return list;
    };
    QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectLevel) {
        switch (errorCorrectLevel) {
            case QRErrorCorrectLevel.L:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case QRErrorCorrectLevel.M:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectLevel.Q:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectLevel.H:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default:
                return undefined;
        }
    };
    function QRBitBuffer() {
        this.buffer = [];
        this.length = 0;
    }

    QRBitBuffer.prototype = {get: function (index) {
        var bufIndex = Math.floor(index / 8);
        return((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
    }, put: function (num, length) {
        for (var i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) == 1);
        }
    }, getLengthInBits: function () {
        return this.length;
    }, putBit: function (bit) {
        var bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
        }
        if (bit) {
            this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
        }
        this.length++;
    }};
    var QRCodeLimitLength = [
        [17, 14, 11, 7],
        [32, 26, 20, 14],
        [53, 42, 32, 24],
        [78, 62, 46, 34],
        [106, 84, 60, 44],
        [134, 106, 74, 58],
        [154, 122, 86, 64],
        [192, 152, 108, 84],
        [230, 180, 130, 98],
        [271, 213, 151, 119],
        [321, 251, 177, 137],
        [367, 287, 203, 155],
        [425, 331, 241, 177],
        [458, 362, 258, 194],
        [520, 412, 292, 220],
        [586, 450, 322, 250],
        [644, 504, 364, 280],
        [718, 560, 394, 310],
        [792, 624, 442, 338],
        [858, 666, 482, 382],
        [929, 711, 509, 403],
        [1003, 779, 565, 439],
        [1091, 857, 611, 461],
        [1171, 911, 661, 511],
        [1273, 997, 715, 535],
        [1367, 1059, 751, 593],
        [1465, 1125, 805, 625],
        [1528, 1190, 868, 658],
        [1628, 1264, 908, 698],
        [1732, 1370, 982, 742],
        [1840, 1452, 1030, 790],
        [1952, 1538, 1112, 842],
        [2068, 1628, 1168, 898],
        [2188, 1722, 1228, 958],
        [2303, 1809, 1283, 983],
        [2431, 1911, 1351, 1051],
        [2563, 1989, 1423, 1093],
        [2699, 2099, 1499, 1139],
        [2809, 2213, 1579, 1219],
        [2953, 2331, 1663, 1273]
    ];

    function _isSupportCanvas() {
        return typeof CanvasRenderingContext2D != "undefined";
    }

    // android 2.x doesn't support Data-URI spec
    function _getAndroid() {
        var android = false;
        var sAgent = navigator.userAgent;

        if (/android/i.test(sAgent)) { // android
            android = true;
            aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);

            if (aMat && aMat[1]) {
                android = parseFloat(aMat[1]);
            }
        }

        return android;
    }

    // Drawing in DOM by using Table tag
    var Drawing = !_isSupportCanvas() ? (function () {
        var Drawing = function (el, htOption) {
            this._el = el;
            this._htOption = htOption;
        };

        /**
         * Draw the QRCode
         *
         * @param {QRCode} oQRCode
         */
        Drawing.prototype.draw = function (oQRCode) {
            var _htOption = this._htOption;
            var _el = this._el;
            var nCount = oQRCode.getModuleCount();
            var nWidth = Math.floor(_htOption.width / nCount);
            var nHeight = Math.floor(_htOption.height / nCount);
            var aHTML = ['<table style="border:0;border-collapse:collapse;">'];

            for (var row = 0; row < nCount; row++) {
                aHTML.push('<tr>');

                for (var col = 0; col < nCount; col++) {
                    aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (oQRCode.isDark(row, col) ? _htOption.colorDark : _htOption.colorLight) + ';"></td>');
                }

                aHTML.push('</tr>');
            }

            aHTML.push('</table>');
            _el.innerHTML = aHTML.join('');

            // Fix the margin values as real size.
            var elTable = _el.childNodes[0];
            var nLeftMarginTable = (_htOption.width - elTable.offsetWidth) / 2;
            var nTopMarginTable = (_htOption.height - elTable.offsetHeight) / 2;

            if (nLeftMarginTable > 0 && nTopMarginTable > 0) {
                elTable.style.margin = nTopMarginTable + "px " + nLeftMarginTable + "px";
            }
        };

        /**
         * Clear the QRCode
         */
        Drawing.prototype.clear = function () {
            this._el.innerHTML = '';
        };

        return Drawing;
    })() : (function () { // Drawing in Canvas
        function _onMakeImage() {
            this._elImage.src = this._elCanvas.toDataURL("image/png");
            this._elImage.style.display = "block";
            this._elCanvas.style.display = "none";
        }

        // Android 2.1 bug workaround
        // http://code.google.com/p/android/issues/detail?id=5141
        if (this._android && this._android <= 2.1) {
            var factor = 1 / window.devicePixelRatio;
            var drawImage = CanvasRenderingContext2D.prototype.drawImage;
            CanvasRenderingContext2D.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
                if (("nodeName" in image) && /img/i.test(image.nodeName)) {
                    for (var i = arguments.length - 1; i >= 1; i--) {
                        arguments[i] = arguments[i] * factor;
                    }
                } else if (typeof dw == "undefined") {
                    arguments[1] *= factor;
                    arguments[2] *= factor;
                    arguments[3] *= factor;
                    arguments[4] *= factor;
                }

                drawImage.apply(this, arguments);
            };
        }

        /**
         * Check whether the user's browser supports Data URI or not
         *
         * @private
         * @param {Function} fSuccess Occurs if it supports Data URI
         * @param {Function} fFail Occurs if it doesn't support Data URI
         */
        function _safeSetDataURI(fSuccess, fFail) {
            var self = this;
            self._fFail = fFail;
            self._fSuccess = fSuccess;

            // Check it just once
            if (self._bSupportDataURI === null) {
                var el = document.createElement("img");
                var fOnError = function () {
                    self._bSupportDataURI = false;

                    if (self._fFail) {
                        _fFail.call(self);
                    }
                };
                var fOnSuccess = function () {
                    self._bSupportDataURI = true;

                    if (self._fSuccess) {
                        self._fSuccess.call(self);
                    }
                };

                el.onabort = fOnError;
                el.onerror = fOnError;
                el.onload = fOnSuccess;
                el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
                return;
            } else if (self._bSupportDataURI === true && self._fSuccess) {
                self._fSuccess.call(self);
            } else if (self._bSupportDataURI === false && self._fFail) {
                self._fFail.call(self);
            }
        };

        /**
         * Drawing QRCode by using canvas
         *
         * @constructor
         * @param {HTMLElement} el
         * @param {Object} htOption QRCode Options
         */
        var Drawing = function (el, htOption) {
            this._bIsPainted = false;
            this._android = _getAndroid();

            this._htOption = htOption;
            this._elCanvas = document.createElement("canvas");
            this._elCanvas.width = htOption.width;
            this._elCanvas.height = htOption.height;
            el.appendChild(this._elCanvas);
            this._el = el;
            this._oContext = this._elCanvas.getContext("2d");
            this._bIsPainted = false;
            this._elImage = document.createElement("img");
            this._elImage.style.display = "none";
            this._el.appendChild(this._elImage);
            this._bSupportDataURI = null;
        };

        /**
         * Draw the QRCode
         *
         * @param {QRCode} oQRCode
         */
        Drawing.prototype.draw = function (oQRCode) {
            var _elImage = this._elImage;
            var _oContext = this._oContext;
            var _htOption = this._htOption;

            var nCount = oQRCode.getModuleCount();
            var nWidth = _htOption.width / nCount;
            var nHeight = _htOption.height / nCount;
            var nRoundedWidth = Math.round(nWidth);
            var nRoundedHeight = Math.round(nHeight);

            _elImage.style.display = "none";
            this.clear();

            for (var row = 0; row < nCount; row++) {
                for (var col = 0; col < nCount; col++) {
                    var bIsDark = oQRCode.isDark(row, col);
                    var nLeft = col * nWidth;
                    var nTop = row * nHeight;
                    _oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
                    _oContext.lineWidth = 1;
                    _oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
                    _oContext.fillRect(nLeft, nTop, nWidth, nHeight);

                    // 안티 앨리어싱 방지 처리
                    _oContext.strokeRect(
                        Math.floor(nLeft) + 0.5,
                        Math.floor(nTop) + 0.5,
                        nRoundedWidth,
                        nRoundedHeight
                    );

                    _oContext.strokeRect(
                        Math.ceil(nLeft) - 0.5,
                        Math.ceil(nTop) - 0.5,
                        nRoundedWidth,
                        nRoundedHeight
                    );
                }
            }

            this._bIsPainted = true;
        };

        /**
         * Make the image from Canvas if the browser supports Data URI.
         */
        Drawing.prototype.makeImage = function () {
            if (this._bIsPainted) {
                _safeSetDataURI.call(this, _onMakeImage);
            }
        };

        /**
         * Return whether the QRCode is painted or not
         *
         * @return {Boolean}
         */
        Drawing.prototype.isPainted = function () {
            return this._bIsPainted;
        };

        /**
         * Clear the QRCode
         */
        Drawing.prototype.clear = function () {
            this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
            this._bIsPainted = false;
        };

        /**
         * @private
         * @param {Number} nNumber
         */
        Drawing.prototype.round = function (nNumber) {
            if (!nNumber) {
                return nNumber;
            }

            return Math.floor(nNumber * 1000) / 1000;
        };

        return Drawing;
    })();

    /**
     * Get the type by string length
     *
     * @private
     * @param {String} sText
     * @param {Number} nCorrectLevel
     * @return {Number} type
     */
    function _getTypeNumber(sText, nCorrectLevel) {
        var nType = 1;

        for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
            var nLimit = 0;

            switch (nCorrectLevel) {
                case QRErrorCorrectLevel.L :
                    nLimit = QRCodeLimitLength[i][0];
                    break;
                case QRErrorCorrectLevel.M :
                    nLimit = QRCodeLimitLength[i][1];
                    break;
                case QRErrorCorrectLevel.Q :
                    nLimit = QRCodeLimitLength[i][2];
                    break;
                case QRErrorCorrectLevel.H :
                    nLimit = QRCodeLimitLength[i][3];
                    break;
            }

            if (sText.length <= nLimit) {
                break;
            } else {
                nType++;
            }
        }

        if (nType > QRCodeLimitLength.length) {
            throw new Error("Too long data");
        }

        return nType;
    }

    /**
     * @class QRCode
     * @constructor
     * @example
     * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
     *
     * @example
     * var oQRCode = new QRCode("test", {
	 *    text : "http://naver.com",
	 *    width : 128,
	 *    height : 128
	 * });
     *
     * oQRCode.clear(); // Clear the QRCode.
     * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
     *
     * @param {HTMLElement|String} el target element or 'id' attribute of element.
     * @param {Object|String} vOption
     * @param {String} vOption.text QRCode link data
     * @param {Number} [vOption.width=256]
     * @param {Number} [vOption.height=256]
     * @param {String} [vOption.colorDark="#000000"]
     * @param {String} [vOption.colorLight="#ffffff"]
     * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H]
     */
    QRCode = function (el, vOption) {
        this._htOption = {
            width: 256,
            height: 256,
            typeNumber: 4,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRErrorCorrectLevel.H
        };

        if (typeof vOption === 'string') {
            vOption = {
                text: vOption
            };
        }

        // Overwrites options
        if (vOption) {
            for (var i in vOption) {
                this._htOption[i] = vOption[i];
            }
        }

        if (typeof el == "string") {
            el = document.getElementById(el);
        }

        this._android = _getAndroid();
        this._el = el;
        this._oQRCode = null;
        this._oDrawing = new Drawing(this._el, this._htOption);

        if (this._htOption.text) {
            this.makeCode(this._htOption.text);
        }
    };

    /**
     * Make the QRCode
     *
     * @param {String} sText link data
     */
    QRCode.prototype.makeCode = function (sText) {
        this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);
        this._oQRCode.addData(sText);
        this._oQRCode.make();
        this._el.title = sText;
        this._oDrawing.draw(this._oQRCode);
        this.makeImage();
    };

    /**
     * Make the Image from Canvas element
     * - It occurs automatically
     * - Android below 3 doesn't support Data-URI spec.
     *
     * @private
     */
    QRCode.prototype.makeImage = function () {
        if (typeof this._oDrawing.makeImage == "function" && (!this._android || this._android >= 3)) {
            this._oDrawing.makeImage();
        }
    };

    /**
     * Clear the QRCode
     */
    QRCode.prototype.clear = function () {
        this._oDrawing.clear();
    };

    /**
     * @name QRCode.CorrectLevel
     */
    QRCode.CorrectLevel = QRErrorCorrectLevel;
})();
/*
 * JavaScript Templates 2.1.0
 * https://github.com/blueimp/JavaScript-Templates
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Inspired by John Resig's JavaScript Micro-Templating:
 * http://ejohn.org/blog/javascript-micro-templating/
 */

/*jslint evil: true, regexp: true */
/*global document, define */

(function ($) {
    "use strict";
    var tmpl = function (str, data) {
        var f = !/[^\w\-\.:]/.test(str) ? tmpl.cache[str] = tmpl.cache[str] || tmpl(tmpl.load(str)) : new Function(
            tmpl.arg + ',tmpl', "var _e=tmpl.encode" + tmpl.helper + ",_s='" + str.replace(tmpl.regexp, tmpl.func) + "';return _s;");
        return data ? f(data, tmpl) : function (data) {
            return f(data, tmpl);
        };
    };
    tmpl.cache = {};
    tmpl.load = function (id) {
        return document.getElementById(id).innerHTML;
    };
    tmpl.regexp = /([\s'\\])(?![^%]*%\})|(?:\{%(=|#)([\s\S]+?)%\})|(\{%)|(%\})/g;
    tmpl.func = function (s, p1, p2, p3, p4, p5) {
        if (p1) { // whitespace, quote and backspace in interpolation context
            return {
                "\n": "\\n",
                "\r": "\\r",
                "\t": "\\t",
                " ": " "
            }[s] || "\\" + s;
        }
        if (p2) { // interpolation: {%=prop%}, or unescaped: {%#prop%}
            if (p2 === "=") {
                return "'+_e(" + p3 + ")+'";
            }
            return "'+(" + p3 + "||'')+'";
        }
        if (p4) { // evaluation start tag: {%
            return "';";
        }
        if (p5) { // evaluation end tag: %}
            return "_s+='";
        }
    };
    tmpl.encReg = /[<>&"'\x00]/g;
    tmpl.encMap = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "\"": "&quot;",
        "'": "&#39;"
    };
    tmpl.encode = function (s) {
        return String(s || "").replace(
            tmpl.encReg, function (c) {
                return tmpl.encMap[c] || "";
            });
    };
    tmpl.arg = "o";
    tmpl.helper = ",print=function(s,e){_s+=e&&(s||'')||_e(s);}" + ",include=function(s,d){_s+=tmpl(s,d);}";
    if (typeof define === "function" && define.amd) {
        define(function () {
            return tmpl;
        });
    } else {
        $.tmpl = tmpl;
    }
}(this));
(function ($, window) {

    var MSG_TYPE = {
        M_CONNECT_REQ: 'M_CONNECT_REQ',
        M_CONNECT_RES: 'M_CONNECT_RES',
        M_TOKEN_INVALID: 'M_TOKEN_INVALID',
        M_TOKEN_OK: 'M_TOKEN_OK',
        M_SHAKE_INIT: 'M_SHAKE_INIT',     //PC通知M端开始摇晃.
        M_SHAKE_REQ: 'M_SHAKE_REQ',
        M_SHAKE_RES: 'M_SHAKE_RES',
        M_REPLAY: 'M_REPLAY',

        PC_CONNECT_REQ: 'PC_CONNECT_REQ',
        PC_M_CONNECT_RES: 'PC_M_CONNECT_RES',
        PC_M_ALL_CONNECT_RES: 'PC_M_ALL_CONNECT_RES',         //所有 M端接入.
        PC_M_SHAKE_START_TIP: 'PC_M_SHAKE_START_TIP',   //通知所有M端开始摇晃.

        PC_SHAKE_RES: 'PC_SHAKE_RES',

        PC_REPLAY: 'PC_REPLAY'  //重玩
    };

    var CONST_VAR = {
        PORT: ':8181/'
    };

    var pc,  //PC页面
        mm   //Mobile页面
        ;


    var nextFrame = (function () {
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function (callback) {
            return setTimeout(callback, 17);
        }
    })();


    var myEvent = new EventEmitter(),
        whoWin = ''
        ;

    myEvent.addListener('Game-over', function (ID) {
        for (var i = 0, len = pc.boatArr.length, boatID; i < len; i++) {
            boatID = pc.boatArr[i].getID();
            if (ID == boatID) {
                pc.boatArr.remove(i);

                //赢家.
                if (whoWin == '') {
                    whoWin = boatID;
                }

                break;
            }
        }

        //都到达终点刷新页面.
        if (pc.boatArr.length == 0) {
            pc.getSocket().emit(MSG_TYPE.PC_REPLAY, { winID: whoWin });

            setTimeout(function () {
                window.location.reload();
            }, 3000);
        }
    });

    //河流是否到尽头，减少渲染.
    var isRiverOver = false;
    var BOAT = function (id) {
        if (id.toString().toLowerCase().indexOf('boatas') > -1) {
            //静态图片.
            this.$boatS = $('.boatAS');

            this.ID = 'boatAS';

            //动态船.
            this.$boat = $('.boatA');
        }
        else if (id.toString().toLowerCase().indexOf('boatbs') > -1) {
            //静态图片.
            this.$boatS = $('.boatBS');

            this.ID = 'boatBS';

            //动态船.
            this.$boat = $('.boatB');
        }
        else {
            throw Error('Boat init ,wrong ID');
        }

        //隐藏二维码.
        this.$boatS.find('.mQrCode').hide();


        //动力系数.
        this.power = 2;

        //河水.
        this.$river = $('.river');

        this.riverTrans = -1370;

        this.dist = 0;

        this.transWrapper = 2350;
    };
    BOAT.prototype = {
        constructor: BOAT,
        getID: function () {
            return this.ID;
        },
        nextFrame: function () {
            return window.requestAnimationFrame
                || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.oRequestAnimationFrame
                || window.msRequestAnimationFrame
                || function (callback) {
                return setTimeout(callback, 17);
            }
        },
        animate: function () {

            var _self = this
                ;

            _self.$boatS.hide();
            _self.$boat.show();
            _self.rock();
        },
        rock: function () {
            var _self = this
                ;


            var rockFrame = function () {
                _self.power -= 0.01;

                if (_self.power > 0) {
                    //get translatex.
                    if (_self.$river.css('webkitTransform')) {
                        _self.riverTrans = +_self.$river.css('webkitTransform').match(/-\d*\.*\d*/g);
                        _self.riverTrans += (_self.power * 0.65);
                    }
                    _self.transWrapper -= _self.power;

                    //船移动.
                    if (_self.transWrapper > 0) {
                        _self.$boat.css({
                            '-webkit-transform': 'translatex(' + _self.transWrapper + 'px)'
                        });
                    }
                    else {
                        _self.$boat.hide();
                        _self.$boatS.css({
                            '-webkit-transform': 'translatex(0px)'
                        }).show();

                        //二维码隐藏.
                        $('.mQrCode').hide();
                        //到达终点,发送消息
                        myEvent.emitEvent('Game-over', [_self.ID]);
                        return;
                    }


                    //河流移动.
                    if (_self.riverTrans < 0) {
                        _self.$river.css({
                            '-webkit-transform': 'translatex(' + _self.riverTrans + 'px)'
                        });
                    }
                    else {
                        //河流到尽头.
                        isRiverOver = true;
                    }

                    //动画帧数.
                    nextFrame(rockFrame);
                }
                else {
                    _self.power = 0;

                    nextFrame(rockFrame);
                }
            }

            rockFrame();
        },
        pump: function (pumpArg) {

            //摇动加油.
            var _self = this;
            _self.power += 1;

            //上线.
            if (_self.power > 20) {
                _self.power = 20;
            }

        },
        reset: function () {

        }
    };


    var PC = function () {

        //生成二维码.
        this.generateQRCode();

        this.initSocket();
        this.listen();

        this.boatArr = [];
    };
    PC.prototype = {
        constructor: PC,
        initSocket: function () {
            var serverUrl = window.location.origin + CONST_VAR.PORT
                ;
            this.socket = io.connect(serverUrl);
        },
        listen: function () {

            var _self = this,
                tokenArr = [],
                $mQrCode = $('.mQrCode')
                ;

            for (var i = 0, len = $mQrCode.length; i < len; i++) {
                tokenArr.push($mQrCode.eq(i).attr('data-token'));
            }

            //连接，确定一个server socket.
            _self.socket.emit(MSG_TYPE.PC_CONNECT_REQ, { Token: tokenArr });

            //新的终端接入.
            _self.socket.on(MSG_TYPE.PC_M_CONNECT_RES, function (data) {
                var boat = new BOAT(data.ID);

                _self.boatArr.push(boat);
                //隐藏二维码，显示ID.
            });

            //所有终端接入.
            _self.socket.on(MSG_TYPE.PC_M_ALL_CONNECT_RES, function (data) {
                this.emit(MSG_TYPE.PC_M_SHAKE_START_TIP, {});

                var countTick = 3,
                    countInter,
                    $djs = $('.djs')
                    ;

                countInter = setInterval(function () {
                    if (countTick == 0) {
                        $djs.text('GO').animate({ opacity: 0 }, 2000, 'ease-out');
                        clearInterval(countInter);

                        //开始动画.
                        for (var i = 0, len = _self.boatArr.length; i < len; i++) {
                            _self.boatArr[i].animate();
                        }
                    }
                    else {
                        $djs.text(countTick--);
                    }
                }, 1000);

            });

            //晃动数据.
            _self.socket.on(MSG_TYPE.PC_SHAKE_RES, function (data) {
                //分配动画数据.
                //$('.spray').text(data.shakeArg.ID + Date.now());

                for (var i = 0, len = _self.boatArr.length; i < len; i++) {
                    if (_self.boatArr[i].getID() == data.shakeArg.ID) {

                        //获得一次动力.
                        _self.boatArr[i].pump(data.shakeArg);

                    }
                }
            });
        },
        getSocket: function () {
            return this.socket;
        },
        generateQRCode: function () {
            var urlDir = window.location.href;
            var $mQrCode = $('.mQrCode');

            var qrCodeConfig = {
                text: "",
                width: 150,
                height: 150,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            }

            for (var i = 0, mUrl = '' , len = $mQrCode.length , tToken; i < len; i++) {
                mUrl = '';
                tToken = Date.now();

                //生成className  ID  、token
                mUrl += urlDir + '?id=' + $mQrCode.eq(i).parent()[0].className + '&token=' + tToken;

                //记录Token串.
                $mQrCode.eq(i).attr('data-token', tToken);

                qrCodeConfig.text = mUrl;
                new QRCode($mQrCode[i], qrCodeConfig);
            }

        }
    };


    var MOBILE = function (id, token) {
        this.ID = id;
        this.Token = token;
        this.initSocket();
        this.listener();
    };

    MOBILE.prototype = {
        constructor: MOBILE,
        initSocket: function () {
            var serverUrl = window.location.origin + CONST_VAR.PORT;

            this.socket = io.connect(serverUrl);
        },
        listener: function () {
            var _self = this
                ;

            //连接，接入.
            this.socket.emit(MSG_TYPE.M_CONNECT_REQ, {
                ID: _self.ID,
                UA: navigator.userAgent,
                Token: _self.Token
            });

            //Token 失效.
            this.socket.on(MSG_TYPE.M_TOKEN_INVALID, function (data) {
                $('.mID').html('Token 失效<br>请重新扫描二维码');
            });

            //正常接入.
            this.socket.on(MSG_TYPE.M_TOKEN_OK, function (data) {
                $('.mID').html('成功接入');
            });

            //所有终端都已接入.
            this.socket.on(MSG_TYPE.M_SHAKE_INIT, function (data) {

                $('.mID').html('准备摇晃手机');
                _self.startShake();
            });


            //重玩.
            this.socket.on(MSG_TYPE.M_REPLAY, function (data) {
                if (data.winID == _self.ID) {
                    $('.mID').html("恭喜，你赢啦！！！！<br>扫描二维码重玩");
                }
                else {
                    $('.mID').html("矮油，输咯～～～～<br>扫描二维码重玩");
                }
            });
        },
        startShake: function () {
            var _self = this,
                $console = $('.console')
                ;


            window.addEventListener('shake', function (e) {

                //M端显示三个轴的信息.
//                $console.eq(0).text(e.deltaX);
//                $console.eq(1).text(e.deltaY);
//                $console.eq(2).text(e.deltaZ);

                _self.emitShake({
                    ID: _self.ID,
                    deltaX: e.deltaX,
                    deltaY: e.deltaY,
                    deltaZ: e.deltaZ
                });

            }, false);

            _self.shake = new window.Shake();
            _self.shake.start();
        },
        emitShake: function (obj) {
            this.socket.emit(MSG_TYPE.M_SHAKE_REQ, {shakeArg: obj});
        }
    };


    var Route = {
        search: window.location.search.match(/id=(\w*)/) || '-1',   //ID
        token: window.location.search.match(/token=(\w*)/) || '-1',    //Token
        router: function () {

            //PC页面
            if (Route.search == '-1') {
                pc = new PC();
            }
            //Mobile 页面.
            else {

                var result = tmpl(window.TMPL.mbody, { ID: Route.search[1]});
                $('#wrapper').html(result);

                mm = new MOBILE(Route.search[1], Route.token[1]);
            }
            ;
        }
    };

    Route.router();


})(Zepto, window);
