function SyrinxTimeline(n, t) {
    var i = this,
        u = i.$el = $(n),
        f = i.options = $.extend({}, i.defaultOptions, i.getObject(u.data("timelineOptions")), t),
        r = [];
    $(f.bands).each(function (n) {
        var i = this.etherPainter,
            u = this.highlight,
            f = this.theme,
            t = Timeline.createBandInfo(this);
        i && (t.etherPainter = i), u && (t.highlight = u), f && (t.theme = f), n > 0 && (t.syncWith = 0), r.push(t)
    });
    $(window).on("resize", function () {
        clearTimeout(i._resizeTimer), i._resizeTimer = setTimeout(function () {
            i.layout()
        }, 300)
    });
    i.timeline = Timeline.create(n, r, t.direction)
}
var SimileAjax = {
    Platform: {},
    params: {
        errors: "none"
    },
    Graphics: {}
};
SimileAjax.version = "2.2.1", SimileAjax.jQuery = jQuery, SimileAjax.Platform.os = {
    isMac: !1,
    isWin: !1,
    isWin32: !1,
    isUnix: !1
}, SimileAjax.Platform.browser = {
    isIE: !1,
    isNetscape: !1,
    isMozilla: !1,
    isFirefox: !1,
    isOpera: !1,
    isSafari: !1,
    majorVersion: 0,
    minorVersion: 0
},
function () {
    var u = navigator.appName.toLowerCase(),
        n = navigator.userAgent.toLowerCase(),
        i, r, t;
    SimileAjax.Platform.os.isMac = n.indexOf("mac") != -1, SimileAjax.Platform.os.isWin = n.indexOf("win") != -1, SimileAjax.Platform.os.isWin32 = SimileAjax.Platform.isWin && (n.indexOf("95") != -1 || n.indexOf("98") != -1 || n.indexOf("nt") != -1 || n.indexOf("win32") != -1 || n.indexOf("32bit") != -1), SimileAjax.Platform.os.isUnix = n.indexOf("x11") != -1, SimileAjax.Platform.browser.isIE = u.indexOf("microsoft") != -1, SimileAjax.Platform.browser.isNetscape = u.indexOf("netscape") != -1, SimileAjax.Platform.browser.isMozilla = n.indexOf("mozilla") != -1, SimileAjax.Platform.browser.isFirefox = n.indexOf("firefox") != -1, SimileAjax.Platform.browser.isOpera = u.indexOf("opera") != -1, SimileAjax.Platform.browser.isSafari = u.indexOf("safari") != -1, i = function (n) {
        var t = n.split(".");
        SimileAjax.Platform.browser.majorVersion = parseInt(t[0]), SimileAjax.Platform.browser.minorVersion = parseInt(t[1])
    }, r = function (n, t, i) {
        var r = n.indexOf(t, i);
        return r >= 0 ? r : n.length
    }, SimileAjax.Platform.browser.isMozilla && (t = n.indexOf("mozilla/"), t >= 0 && i(n.substring(t + 8, r(n, " ", t)))), SimileAjax.Platform.browser.isIE && (t = n.indexOf("msie "), t >= 0 && i(n.substring(t + 5, r(n, ";", t)))), SimileAjax.Platform.browser.isNetscape && (t = n.indexOf("rv:"), t >= 0 && i(n.substring(t + 3, r(n, ")", t)))), SimileAjax.Platform.browser.isFirefox && (t = n.indexOf("firefox/"), t >= 0 && i(n.substring(t + 8, r(n, " ", t)))), "localeCompare" in String.prototype || (String.prototype.localeCompare = function (n) {
        return this < n ? -1 : this > n ? 1 : 0
    })
}(), SimileAjax.Platform.getDefaultLocale = function () {
    return SimileAjax.Platform.clientLocale
}, SimileAjax.DateTime = {}, SimileAjax.DateTime.MILLISECOND = 0, SimileAjax.DateTime.SECOND = 1, SimileAjax.DateTime.MINUTE = 2, SimileAjax.DateTime.HOUR = 3, SimileAjax.DateTime.DAY = 4, SimileAjax.DateTime.WEEK = 5, SimileAjax.DateTime.MONTH = 6, SimileAjax.DateTime.YEAR = 7, SimileAjax.DateTime.DECADE = 8, SimileAjax.DateTime.CENTURY = 9, SimileAjax.DateTime.MILLENNIUM = 10, SimileAjax.DateTime.EPOCH = -1, SimileAjax.DateTime.ERA = -2, SimileAjax.DateTime.gregorianUnitLengths = [],
function () {
    var n = SimileAjax.DateTime,
        t = n.gregorianUnitLengths;
    t[n.MILLISECOND] = 1, t[n.SECOND] = 1e3, t[n.MINUTE] = t[n.SECOND] * 60, t[n.HOUR] = t[n.MINUTE] * 60, t[n.DAY] = t[n.HOUR] * 24, t[n.WEEK] = t[n.DAY] * 7, t[n.MONTH] = t[n.DAY] * 31, t[n.YEAR] = t[n.DAY] * 365, t[n.DECADE] = t[n.YEAR] * 10, t[n.CENTURY] = t[n.YEAR] * 100, t[n.MILLENNIUM] = t[n.YEAR] * 1e3
}(), SimileAjax.DateTime._dateRegexp = new RegExp("^(-?)([0-9]{4})((-?([0-9]{2})(-?([0-9]{2}))?)|(-?([0-9]{3}))|(-?W([0-9]{2})(-?([1-7]))?))?$"), SimileAjax.DateTime._timezoneRegexp = new RegExp("Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$"), SimileAjax.DateTime._timeRegexp = new RegExp("^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(.([0-9]+))?)?)?$"), SimileAjax.DateTime.setIso8601Date = function (n, t) {
    var i = t.match(SimileAjax.DateTime._dateRegexp);
    if (!i) throw new Error("Invalid date string: " + t);
    var c = i[1] == "-" ? -1 : 1,
        l = c * i[2],
        u = i[5],
        f = i[7],
        e = i[9],
        o = i[11],
        a = i[13] ? i[13] : 1;
    if (n.setUTCFullYear(l), e) n.setUTCMonth(0), n.setUTCDate(Number(e));
    else if (o) {
        n.setUTCMonth(0), n.setUTCDate(1);
        var s = n.getUTCDay(),
            r = s ? s : 7,
            h = Number(a) + 7 * Number(o);
        r <= 4 ? n.setUTCDate(h + 1 - r) : n.setUTCDate(h + 8 - r)
    } else u && (n.setUTCDate(1), n.setUTCMonth(u - 1)), f && n.setUTCDate(f);
    return n
}, SimileAjax.DateTime.setIso8601Time = function (n, t) {
    var i = t.match(SimileAjax.DateTime._timeRegexp);
    if (!i) return !1;
    var r = i[1],
        u = Number(i[3] ? i[3] : 0),
        f = i[5] ? i[5] : 0,
        e = i[7] ? Number("0." + i[7]) * 1e3 : 0;
    return n.setUTCHours(r), n.setUTCMinutes(u), n.setUTCSeconds(f), n.setUTCMilliseconds(e), n
}, SimileAjax.DateTime.timezoneOffset = (new Date).getTimezoneOffset(), SimileAjax.DateTime.setIso8601 = function (n, t) {
    var u = null,
        i = t.indexOf("T") == -1 ? t.split(" ") : t.split("T"),
        r;
    return SimileAjax.DateTime.setIso8601Date(n, i[0]), i.length == 2 && (r = i[1].match(SimileAjax.DateTime._timezoneRegexp), r && (r[0] == "Z" ? u = 0 : (u = Number(r[3]) * 60 + Number(r[5]), u *= r[2] == "-" ? 1 : -1), i[1] = i[1].substr(0, i[1].length - r[0].length)), SimileAjax.DateTime.setIso8601Time(n, i[1])), u == null && (u = n.getTimezoneOffset()), n.setTime(n.getTime() + u * 6e4), n
}, SimileAjax.DateTime.parseIso8601DateTime = function (n) {
    try {
        return SimileAjax.DateTime.setIso8601(new Date(0), n)
    } catch (t) {
        return null
    }
}, SimileAjax.DateTime.parseGregorianDateTime = function (n) {
    var t, r, f, i, u;
    if (n == null) return null;
    if (n instanceof Date) return n;
    if (t = n.toString(), t.length > 0 && t.length < 8) return r = t.indexOf(" "), r > 0 ? (i = parseInt(t.substr(0, r)), f = t.substr(r + 1), f.toLowerCase() == "bc" && (i = 1 - i)) : i = parseInt(t), u = new Date(0), u.setUTCFullYear(i), u;
    try {
        return new Date(Date.parse(t))
    } catch (e) {
        return null
    }
}, SimileAjax.DateTime.roundDownToInterval = function (n, t, i, r, u) {
    var h = i * SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR],
        f = new Date(n.getTime() + h),
        o = function (n) {
            n.setUTCMilliseconds(0), n.setUTCSeconds(0), n.setUTCMinutes(0), n.setUTCHours(0)
        }, s = function (n) {
            o(n), n.setUTCDate(1), n.setUTCMonth(0)
        }, c, e;
    switch (t) {
    case SimileAjax.DateTime.MILLISECOND:
        e = f.getUTCMilliseconds(), f.setUTCMilliseconds(e - e % r);
        break;
    case SimileAjax.DateTime.SECOND:
        f.setUTCMilliseconds(0), e = f.getUTCSeconds(), f.setUTCSeconds(e - e % r);
        break;
    case SimileAjax.DateTime.MINUTE:
        f.setUTCMilliseconds(0), f.setUTCSeconds(0), e = f.getUTCMinutes(), f.setTime(f.getTime() - e % r * SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.MINUTE]);
        break;
    case SimileAjax.DateTime.HOUR:
        f.setUTCMilliseconds(0), f.setUTCSeconds(0), f.setUTCMinutes(0), e = f.getUTCHours(), f.setUTCHours(e - e % r);
        break;
    case SimileAjax.DateTime.DAY:
        o(f);
        break;
    case SimileAjax.DateTime.WEEK:
        o(f), c = (f.getUTCDay() + 7 - u) % 7, f.setTime(f.getTime() - c * SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.DAY]);
        break;
    case SimileAjax.DateTime.MONTH:
        o(f), f.setUTCDate(1), e = f.getUTCMonth(), f.setUTCMonth(e - e % r);
        break;
    case SimileAjax.DateTime.YEAR:
        s(f), e = f.getUTCFullYear(), f.setUTCFullYear(e - e % r);
        break;
    case SimileAjax.DateTime.DECADE:
        s(f), f.setUTCFullYear(Math.floor(f.getUTCFullYear() / 10) * 10);
        break;
    case SimileAjax.DateTime.CENTURY:
        s(f), f.setUTCFullYear(Math.floor(f.getUTCFullYear() / 100) * 100);
        break;
    case SimileAjax.DateTime.MILLENNIUM:
        s(f), f.setUTCFullYear(Math.floor(f.getUTCFullYear() / 1e3) * 1e3)
    }
    n.setTime(f.getTime() - h)
}, SimileAjax.DateTime.roundUpToInterval = function (n, t, i, r, u) {
    var f = n.getTime();
    SimileAjax.DateTime.roundDownToInterval(n, t, i, r, u), n.getTime() < f && n.setTime(n.getTime() + SimileAjax.DateTime.gregorianUnitLengths[t] * r)
}, SimileAjax.DateTime.incrementByInterval = function (n, t, i) {
    i = typeof i == "undefined" ? 0 : i;
    var u = i * SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR],
        r = new Date(n.getTime() + u);
    switch (t) {
    case SimileAjax.DateTime.MILLISECOND:
        r.setTime(r.getTime() + 1);
        break;
    case SimileAjax.DateTime.SECOND:
        r.setTime(r.getTime() + 1e3);
        break;
    case SimileAjax.DateTime.MINUTE:
        r.setTime(r.getTime() + SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.MINUTE]);
        break;
    case SimileAjax.DateTime.HOUR:
        r.setTime(r.getTime() + SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR]);
        break;
    case SimileAjax.DateTime.DAY:
        r.setUTCDate(r.getUTCDate() + 1);
        break;
    case SimileAjax.DateTime.WEEK:
        r.setUTCDate(r.getUTCDate() + 7);
        break;
    case SimileAjax.DateTime.MONTH:
        r.setUTCMonth(r.getUTCMonth() + 1);
        break;
    case SimileAjax.DateTime.YEAR:
        r.setUTCFullYear(r.getUTCFullYear() + 1);
        break;
    case SimileAjax.DateTime.DECADE:
        r.setUTCFullYear(r.getUTCFullYear() + 10);
        break;
    case SimileAjax.DateTime.CENTURY:
        r.setUTCFullYear(r.getUTCFullYear() + 100);
        break;
    case SimileAjax.DateTime.MILLENNIUM:
        r.setUTCFullYear(r.getUTCFullYear() + 1e3)
    }
    n.setTime(r.getTime() - u)
}, SimileAjax.DateTime.removeTimeZoneOffset = function (n, t) {
    return new Date(n.getTime() + t * SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR])
}, SimileAjax.DateTime.getTimezone = function () {
    var n = (new Date).getTimezoneOffset();
    return n / -60
}, window.Timeline = {
    DateTime: SimileAjax.DateTime,
    urlPrefix: "/jquery.timeline/content/",
    clientLocale: "en",
    version: "4.0.2",
    strings: []
}, SyrinxTimeline.prototype = {
    defaultOptions: {
        direction: Timeline.HORIZONTAL
    },
    getOptions: function () {
        return this.options
    },
    getObject: function (css) {
        return typeof css == "string" ? css != null && css.length != 0 ? eval("(" + css + ")") : null : css
    },
    layout: function () {
        this.timeline.layout()
    }
}, $.fn.syrinxTimeline = function (n) {
    var i = Array.prototype.slice.call(arguments, 1),
        t = this;
    return this.each(function () {
        var r = $(this).data("SyrinxTimeline"),
            u;
        undefined === r ? (u = $(this), r = new SyrinxTimeline(this, n), u.data("SyrinxTimeline", r, this.href)) : r[n] && (t = r[n].apply(r, i))
    }), t
}, $.extend(SimileAjax.Graphics, {
    bubbleConfig: {
        containerCSSClass: "simileAjax-bubble-container",
        innerContainerCSSClass: "simileAjax-bubble-innerContainer",
        contentContainerCSSClass: "simileAjax-bubble-contentContainer",
        borderGraphicSize: 50,
        borderGraphicCSSClassPrefix: "simileAjax-bubble-border-",
        arrowGraphicTargetOffset: 33,
        arrowGraphicLength: 100,
        arrowGraphicWidth: 49,
        arrowGraphicCSSClassPrefix: "simileAjax-bubble-arrow-",
        closeGraphicCSSClass: "simileAjax-bubble-close",
        extraPadding: 2
    },
    createBubbleForContentAndPoint: function (n, t, i, r, u, f) {
        typeof r != "number" && (r = 300), typeof f != "number" && (f = 0);
        var e = $(n).css({
            position: "absolute",
            left: "-5000px",
            top: "0px",
            width: r + "px"
        }).appendTo("body");
        window.setTimeout(function () {
            var r = n.scrollWidth + 0,
                o = n.scrollHeight + 0,
                s = 0,
                h;
            f > 0 && o > f && (o = f, s = r - 25), h = SimileAjax.Graphics.createBubbleForPoint(t, i, r, o, u), document.body.removeChild(n), e.css({
                position: "static",
                left: "",
                top: ""
            }), s > 0 ? (n.style.width = "", $("<div style='width:" + s + "px'/>").appendTo(h.content).append(n)) : e.css("width", r + "px").appendTo(h.content)
        }, 200)
    },
    createBubbleForPoint: function (n, t, i, r, u) {
        var h, s, l, a;
        i = parseInt(i, 10), r = parseInt(r, 10);
        var f = SimileAjax.Graphics.bubbleConfig,
            v = SimileAjax.Graphics.pngIsTranslucent ? "pngTranslucent" : "pngNotTranslucent",
            w = i + 2 * f.borderGraphicSize,
            b = r + 2 * f.borderGraphicSize,
            c = function (n) {
                return n + " " + n + "-" + v
            }, e = document.createElement("div");
        e.className = c(f.containerCSSClass), e.style.width = i + "px", e.style.height = r + "px", h = document.createElement("div"), h.className = c(f.innerContainerCSSClass), e.appendChild(h);
        var y = function () {
            o._closed || (document.body.removeChild(o._div), o._doc = null, o._div = null, o._content = null, o._closed = !0)
        }, o = {
                _closed: !1
            }, p = SimileAjax.WindowManager.pushLayer(y, !0, e);
        o._div = e, o.close = function () {
            SimileAjax.WindowManager.popLayer(p)
        }, s = function (n) {
            var t = document.createElement("div");
            t.className = c(f.borderGraphicCSSClassPrefix + n), h.appendChild(t)
        }, s("top-left"), s("top-right"), s("bottom-left"), s("bottom-right"), s("left"), s("right"), s("top"), s("bottom"), l = document.createElement("div"), l.className = c(f.contentContainerCSSClass), h.appendChild(l), o.content = l, a = document.createElement("div"), a.className = c(f.closeGraphicCSSClass), h.appendChild(a);
        $(a).on("click", function () {
            o.close()
        });
        return function () {
            var w = SimileAjax.Graphics.getWindowDimensions(),
                y = w.w,
                p = w.h,
                a = Math.ceil(f.arrowGraphicWidth / 2),
                v = function (n) {
                    var t = document.createElement("div");
                    return t.className = c(f.arrowGraphicCSSClassPrefix + "point-" + n), h.appendChild(t), t
                }, o, s, l;
            if (n - a - f.borderGraphicSize - f.extraPadding > 0 && n + a + f.borderGraphicSize + f.extraPadding < y) {
                if (o = n - Math.round(i / 2), o = n < y / 2 ? Math.max(o, f.extraPadding + f.borderGraphicSize) : Math.min(o, y - f.extraPadding - f.borderGraphicSize - i), u && u == "top" || !u && t - f.arrowGraphicTargetOffset - r - f.borderGraphicSize - f.extraPadding > 0) {
                    l = v("down"), l.style.left = n - a - o + "px", e.style.left = o + "px", e.style.top = t - f.arrowGraphicTargetOffset - r + "px";
                    return
                }
                if (u && u == "bottom" || !u && t + f.arrowGraphicTargetOffset + r + f.borderGraphicSize + f.extraPadding < p) {
                    l = v("up"), l.style.left = n - a - o + "px", e.style.left = o + "px", e.style.top = t + f.arrowGraphicTargetOffset + "px";
                    return
                }
            }
            s = t - Math.round(r / 2), s = t < p / 2 ? Math.max(s, f.extraPadding + f.borderGraphicSize) : Math.min(s, p - f.extraPadding - f.borderGraphicSize - r), u && u == "left" || !u && n - f.arrowGraphicTargetOffset - i - f.borderGraphicSize - f.extraPadding > 0 ? (l = v("right"), l.style.top = t - a - s + "px", e.style.top = s + "px", e.style.left = n - f.arrowGraphicTargetOffset - i + "px") : (l = v("left"), l.style.top = t - a - s + "px", e.style.top = s + "px", e.style.left = n + f.arrowGraphicTargetOffset + "px")
        }(), document.body.appendChild(e), o
    },
    createMessageBubble: function (n) {
        var t = n.createElement("div"),
            i, o, u, f, r, s, e;
        return SimileAjax.Graphics.pngIsTranslucent ? (i = n.createElement("div"), i.style.height = "33px", i.style.background = "url(" + Timeline.urlPrefix + "images/message-top-left.png) top left no-repeat", i.style.paddingLeft = "44px", t.appendChild(i), o = n.createElement("div"), o.style.height = "33px", o.style.background = "url(" + Timeline.urlPrefix + "images/message-top-right.png) top right no-repeat", i.appendChild(o), u = n.createElement("div"), u.style.background = "url(" + Timeline.urlPrefix + "images/message-left.png) top left repeat-y", u.style.paddingLeft = "44px", t.appendChild(u), f = n.createElement("div"), f.style.background = "url(" + Timeline.urlPrefix + "images/message-right.png) top right repeat-y", f.style.paddingRight = "44px", u.appendChild(f), e = n.createElement("div"), f.appendChild(e), r = n.createElement("div"), r.style.height = "55px", r.style.background = "url(" + Timeline.urlPrefix + "images/message-bottom-left.png) bottom left no-repeat", r.style.paddingLeft = "44px", t.appendChild(r), s = n.createElement("div"), s.style.height = "55px", s.style.background = "url(" + Timeline.urlPrefix + "images/message-bottom-right.png) bottom right no-repeat", r.appendChild(s)) : (t.style.border = "2px solid #7777AA", t.style.padding = "20px", t.style.background = "white", SimileAjax.Graphics.setOpacity(t, 90), e = n.createElement("div"), t.appendChild(e)), {
            containerDiv: t,
            contentDiv: e
        }
    }
}), SimileAjax.Set = function (n) {
    if (this._hash = {}, this._count = 0, n instanceof Array)
        for (var t = 0; t < n.length; t++) this.add(n[t]);
    else n instanceof SimileAjax.Set && this.addSet(n)
}, SimileAjax.Set.prototype.add = function (n) {
    return n in this._hash ? !1 : (this._hash[n] = !0, this._count++, !0)
}, SimileAjax.Set.prototype.addSet = function (n) {
    for (var t in n._hash) this.add(t)
}, SimileAjax.Set.prototype.remove = function (n) {
    return n in this._hash ? (delete this._hash[n], this._count--, !0) : !1
}, SimileAjax.Set.prototype.removeSet = function (n) {
    for (var t in n._hash) this.remove(t)
}, SimileAjax.Set.prototype.retainSet = function (n) {
    for (var t in this._hash) n.contains(t) || (delete this._hash[t], this._count--)
}, SimileAjax.Set.prototype.contains = function (n) {
    return n in this._hash
}, SimileAjax.Set.prototype.size = function () {
    return this._count
}, SimileAjax.Set.prototype.toArray = function () {
    var n = [],
        t;
    for (t in this._hash) n.push(t);
    return n
}, SimileAjax.Set.prototype.visit = function (n) {
    for (var t in this._hash)
        if (n(t) == !0) break
}, SimileAjax.SortedArray = function (n, t) {
    this._a = t instanceof Array ? t : [], this._compare = n
}, SimileAjax.SortedArray.prototype.add = function (n) {
    var i = this,
        t = this.find(function (t) {
            return i._compare(t, n)
        });
    t < this._a.length ? this._a.splice(t, 0, n) : this._a.push(n)
}, SimileAjax.SortedArray.prototype.remove = function (n) {
    for (var i = this, t = this.find(function (t) {
            return i._compare(t, n)
        }); t < this._a.length && this._compare(this._a[t], n) == 0;) {
        if (this._a[t] == n) return this._a.splice(t, 1), !0;
        t++
    }
    return !1
}, SimileAjax.SortedArray.prototype.removeAll = function () {
    this._a = []
}, SimileAjax.SortedArray.prototype.elementAt = function (n) {
    return this._a[n]
}, SimileAjax.SortedArray.prototype.length = function () {
    return this._a.length
}, SimileAjax.SortedArray.prototype.find = function (n) {
    for (var t = 0, r = this._a.length, i, u; t < r;) {
        if (i = Math.floor((t + r) / 2), u = n(this._a[i]), i == t) return u < 0 ? t + 1 : t;
        u < 0 ? t = i : r = i
    }
    return t
}, SimileAjax.SortedArray.prototype.getFirst = function () {
    return this._a.length > 0 ? this._a[0] : null
}, SimileAjax.SortedArray.prototype.getLast = function () {
    return this._a.length > 0 ? this._a[this._a.length - 1] : null
}, SimileAjax.EventIndex = function (n) {
    var t = this;
    this._unit = n != null ? n : SimileAjax.NativeDateUnit, this._events = new SimileAjax.SortedArray(function (n, i) {
        return t._unit.compare(n.getStart(), i.getStart())
    }), this._idToEvent = {}, this._indexed = !0
}, SimileAjax.EventIndex.prototype.getUnit = function () {
    return this._unit
}, SimileAjax.EventIndex.prototype.getEvent = function (n) {
    return this._idToEvent[n]
}, SimileAjax.EventIndex.prototype.add = function (n) {
    this._events.add(n), this._idToEvent[n.getID()] = n, this._indexed = !1
}, SimileAjax.EventIndex.prototype.removeAll = function () {
    this._events.removeAll(), this._idToEvent = {}, this._indexed = !1
}, SimileAjax.EventIndex.prototype.getCount = function () {
    return this._events.length()
}, SimileAjax.EventIndex.prototype.getIterator = function (n, t) {
    return this._indexed || this._index(), new SimileAjax.EventIndex._Iterator(this._events, n, t, this._unit)
}, SimileAjax.EventIndex.prototype.getReverseIterator = function (n, t) {
    return this._indexed || this._index(), new SimileAjax.EventIndex._ReverseIterator(this._events, n, t, this._unit)
}, SimileAjax.EventIndex.prototype.getAllIterator = function () {
    return new SimileAjax.EventIndex._AllIterator(this._events)
}, SimileAjax.EventIndex.prototype.getEarliestDate = function () {
    var n = this._events.getFirst();
    return n == null ? null : n.getStart()
}, SimileAjax.EventIndex.prototype.getLatestDate = function () {
    var r = this._events.getLast(),
        i, n, t;
    if (r == null) return null;
    for (this._indexed || this._index(), i = r._earliestOverlapIndex, n = this._events.elementAt(i).getEnd(), t = i + 1; t < this._events.length(); t++) n = this._unit.later(n, this._events.elementAt(t).getEnd());
    return n
}, SimileAjax.EventIndex.prototype._index = function () {
    for (var r = this._events.length(), t, i, f, u, e, n = 0; n < r; n++) i = this._events.elementAt(n), i._earliestOverlapIndex = n;
    for (t = 1, n = 0; n < r; n++)
        for (i = this._events.elementAt(n), f = i.getEnd(), t = Math.max(t, n + 1); t < r;)
            if (u = this._events.elementAt(t), e = u.getStart(), this._unit.compare(e, f) < 0) u._earliestOverlapIndex = n, t++;
            else break;
    this._indexed = !0
}, SimileAjax.EventIndex._Iterator = function (n, t, i, r) {
    this._events = n, this._startDate = t, this._endDate = i, this._unit = r, this._currentIndex = n.find(function (n) {
        return r.compare(n.getStart(), t)
    }), this._currentIndex - 1 >= 0 && (this._currentIndex = this._events.elementAt(this._currentIndex - 1)._earliestOverlapIndex), this._currentIndex--, this._maxIndex = n.find(function (n) {
        return r.compare(n.getStart(), i)
    }), this._hasNext = !1, this._next = null, this._findNext()
}, SimileAjax.EventIndex._Iterator.prototype = {
    hasNext: function () {
        return this._hasNext
    },
    next: function () {
        if (this._hasNext) {
            var n = this._next;
            return this._findNext(), n
        }
        return null
    },
    _findNext: function () {
        for (var t = this._unit, n; ++this._currentIndex < this._maxIndex;)
            if (n = this._events.elementAt(this._currentIndex), t.compare(n.getStart(), this._endDate) < 0 && t.compare(n.getEnd(), this._startDate) > 0) {
                this._next = n, this._hasNext = !0;
                return
            }
        this._next = null, this._hasNext = !1
    }
}, SimileAjax.EventIndex._ReverseIterator = function (n, t, i, r) {
    this._events = n, this._startDate = t, this._endDate = i, this._unit = r, this._minIndex = n.find(function (n) {
        return r.compare(n.getStart(), t)
    }), this._minIndex - 1 >= 0 && (this._minIndex = this._events.elementAt(this._minIndex - 1)._earliestOverlapIndex), this._maxIndex = n.find(function (n) {
        return r.compare(n.getStart(), i)
    }), this._currentIndex = this._maxIndex, this._hasNext = !1, this._next = null, this._findNext()
}, SimileAjax.EventIndex._ReverseIterator.prototype = {
    hasNext: function () {
        return this._hasNext
    },
    next: function () {
        if (this._hasNext) {
            var n = this._next;
            return this._findNext(), n
        }
        return null
    },
    _findNext: function () {
        for (var t = this._unit, n; --this._currentIndex >= this._minIndex;)
            if (n = this._events.elementAt(this._currentIndex), t.compare(n.getStart(), this._endDate) < 0 && t.compare(n.getEnd(), this._startDate) > 0) {
                this._next = n, this._hasNext = !0;
                return
            }
        this._next = null, this._hasNext = !1
    }
}, SimileAjax.EventIndex._AllIterator = function (n) {
    this._events = n, this._index = 0
}, SimileAjax.EventIndex._AllIterator.prototype = {
    hasNext: function () {
        return this._index < this._events.length()
    },
    next: function () {
        return this._index < this._events.length() ? this._events.elementAt(this._index++) : null
    }
}, SimileAjax.DOM = {}, SimileAjax.DOM.registerEvent = function (n, t, i) {
    var r = function (t) {
        if (t = t ? t : event ? event : null, t) {
            var r = t.target ? t.target : t.srcElement ? t.srcElement : t.target ? t.target : null;
            return r && (r = r.nodeType == 1 || r.nodeType == 9 ? r : r.parentNode), i(n, t, r)
        }
        return !0
    };
    SimileAjax.Platform.browser.isIE ? n.attachEvent("on" + t, r) : n.addEventListener(t, r, !1)
}, SimileAjax.DOM.getPageCoordinates = function (n) {
    var i = 0,
        r = 0,
        t, u;
    for (n.nodeType != 1 && (n = n.parentNode), t = n; t != null;) i += t.offsetLeft, r += t.offsetTop, t = t.offsetParent;
    for (u = document.body; n != null && n != u;) "scrollLeft" in n && (i -= n.scrollLeft, r -= n.scrollTop), n = n.parentNode;
    return {
        left: i,
        top: r
    }
}, SimileAjax.DOM.getEventRelativeCoordinates = function (n, t) {
    var i;
    return SimileAjax.Platform.browser.isIE ? n.type == "mousewheel" ? (i = SimileAjax.DOM.getPageCoordinates(t), {
        x: n.clientX - i.left,
        y: n.clientY - i.top
    }) : {
        x: n.offsetX,
        y: n.offsetY
    } : (i = SimileAjax.DOM.getPageCoordinates(t), n.type == "DOMMouseScroll" && SimileAjax.Platform.browser.isFirefox && SimileAjax.Platform.browser.majorVersion == 2 ? {
        x: n.screenX - i.left,
        y: n.screenY - i.top
    } : {
        x: n.pageX - i.left,
        y: n.pageY - i.top
    })
}, SimileAjax.DOM.getEventPageCoordinates = function (n) {
    if (SimileAjax.Platform.browser.isIE) {
        var t = 0,
            i = 0;
        return document.body && (document.body.scrollLeft || document.body.scrollTop) ? (t = document.body.scrollTop, i = document.body.scrollLeft) : document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop) && (t = document.documentElement.scrollTop, i = document.documentElement.scrollLeft), {
            x: n.clientX + i,
            y: n.clientY + t
        }
    }
    return {
        x: n.pageX,
        y: n.pageY
    }
}, SimileAjax.DOM.cancelEvent = function (n) {
    n.returnValue = !1, n.cancelBubble = !0, "preventDefault" in n && n.preventDefault()
}, $.extend(SimileAjax.Graphics, {
    pngIsTranslucent: !SimileAjax.Platform.browser.isIE || SimileAjax.Platform.browser.majorVersion > 6,
    createTranslucentImage: function (n, t) {
        var i = document.createElement("img");
        return i.setAttribute("src", n), t != null && (i.style.verticalAlign = t), i
    },
    createTranslucentImageHTML: function (n, t) {
        return '<img src="' + n + '"' + (t != null ? ' style="vertical-align: ' + t + ';"' : "") + " />"
    },
    setOpacity: function (n, t) {
        if (SimileAjax.Platform.browser.isIE) n.style.filter = "progid:DXImageTransform.Microsoft.Alpha(Style=0,Opacity=" + t + ")";
        else {
            var i = (t / 100).toString();
            n.style.opacity = i, n.style.MozOpacity = i
        }
    },
    getWindowDimensions: function () {
        return typeof window.innerHeight == "number" ? {
            w: window.innerWidth,
            h: window.innerHeight
        } : document.documentElement && document.documentElement.clientHeight ? {
            w: document.documentElement.clientWidth,
            h: document.documentElement.clientHeight
        } : document.body && document.body.clientHeight ? {
            w: document.body.clientWidth,
            h: document.body.clientHeight
        } : void 0
    },
    createStructuredDataCopyButton: function (n, t, i, r) {
        var u = document.createElement("div"),
            e, f;
        return u.style.position = "relative", u.style.display = "inline", u.style.width = t + "px", u.style.height = i + "px", u.style.overflow = "hidden", u.style.margin = "2px", SimileAjax.Graphics.pngIsTranslucent ? u.style.background = "url(" + n + ") no-repeat" : u.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + n + "', sizingMethod='image')", e = SimileAjax.Platform.browser.isIE ? "filter:alpha(opacity=0)" : "opacity: 0", u.innerHTML = "<textarea rows='1' autocomplete='off' value='none' style='" + e + "' />", f = u.firstChild, f.style.width = t + "px", f.style.height = i + "px", f.onmousedown = function (n) {
            n = n ? n : event ? event : null, n.button == 2 && (f.value = r(), f.select())
        }, u
    },
    getWidthHeight: function (n) {
        var i, r, t;
        return n.getBoundingClientRect == null ? (i = n.offsetWidth, r = n.offsetHeight) : (t = n.getBoundingClientRect(), i = Math.ceil(t.right - t.left), r = Math.ceil(t.bottom - t.top)), {
            width: i,
            height: r
        }
    },
    getFontRenderingContext: function (n, t) {
        return new SimileAjax.Graphics._FontRenderingContext(n, t)
    },
    _FontRenderingContext: function (n, t) {
        this._elmt = n, this._elmt.style.visibility = "hidden", typeof t == "string" ? this._elmt.style.width = t : typeof t == "number" && (this._elmt.style.width = t + "px")
    },
    createAnimation: function (n, t, i, r, u) {
        return new SimileAjax.Graphics._Animation(n, t, i, r, u)
    },
    _Animation: function (n, t, i, r, u) {
        this.f = n, this.cont = typeof u == "function" ? u : function () {}, this.from = t, this.to = i, this.current = t, this.duration = r, this.start = +new Date, this.timePassed = 0
    }
}), $.extend(SimileAjax.Graphics._Animation.prototype, {
    run: function () {
        var n = this;
        window.setTimeout(function () {
            n.step()
        }, 50)
    },
    step: function () {
        this.timePassed += 50;
        var t = this.timePassed / this.duration,
            i = -Math.cos(t * Math.PI) / 2 + .5,
            n = i * (this.to - this.from) + this.from;
        try {
            this.f(n, n - this.current)
        } catch (r) {}
        this.current = n, this.timePassed < this.duration ? this.run() : (this.f(this.to, 0), this.cont())
    }
}), $.extend(SimileAjax.Graphics._FontRenderingContext.prototype, {
    dispose: function () {
        this._elmt = null
    },
    update: function () {
        this._elmt.innerHTML = "A", this._lineHeight = this._elmt.offsetHeight
    },
    computeSize: function (n, t) {
        var i = this._elmt,
            r;
        return i.innerHTML = n, i.className = t === undefined ? "" : t, r = SimileAjax.Graphics.getWidthHeight(i), i.className = "", r
    },
    getLineHeight: function () {
        return this._lineHeight
    }
}), SimileAjax.NativeDateUnit = {}, SimileAjax.NativeDateUnit.makeDefaultValue = function () {
    return new Date
}, SimileAjax.NativeDateUnit.cloneValue = function (n) {
    return new Date(n.getTime())
}, SimileAjax.NativeDateUnit.getParser = function (n) {
    typeof n == "string" && (n = n.toLowerCase());
    var t = n == "iso8601" || n == "iso 8601" ? SimileAjax.DateTime.parseIso8601DateTime : SimileAjax.DateTime.parseGregorianDateTime;
    return function (n) {
        return n == null || typeof n != "undefined" && typeof n.toUTCString == "function" ? n : t(n)
    }
}, SimileAjax.NativeDateUnit.parseFromObject = function (n) {
    return SimileAjax.DateTime.parseGregorianDateTime(n)
}, SimileAjax.NativeDateUnit.toNumber = function (n) {
    return n.getTime()
}, SimileAjax.NativeDateUnit.fromNumber = function (n) {
    return new Date(n)
}, SimileAjax.NativeDateUnit.compare = function (n, t) {
    var i, r;
    return i = typeof n == "object" ? n.getTime() : Number(n), r = typeof t == "object" ? t.getTime() : Number(t), i - r
}, SimileAjax.NativeDateUnit.earlier = function (n, t) {
    return SimileAjax.NativeDateUnit.compare(n, t) < 0 ? n : t
}, SimileAjax.NativeDateUnit.later = function (n, t) {
    return SimileAjax.NativeDateUnit.compare(n, t) > 0 ? n : t
}, SimileAjax.NativeDateUnit.change = function (n, t) {
    return new Date(n.getTime() + t)
}, SimileAjax.WindowManager = {
    _initialized: !1,
    _listeners: [],
    _layers: [],
    initialize: function () {
        function n(n) {
            $(n).each(function () {
                $("<img />").attr("src", Timeline.urlPrefix + "images/" + this).appendTo("body").css("display", "none")
            })
        }
        SimileAjax.WindowManager._initialized || (setTimeout(function () {
            n(["bubble-arrow-point-down.png", "bubble-arrow-point-left.png", "bubble-arrow-point-right.png", "bubble-arrow-point-up.png", "bubble-bottom-arrow.png", "bubble-bottom-left.png", "bubble-bottom-right.png", "bubble-bottom.png", "bubble-left-arrow.png", "bubble-left.png", "bubble-right-arrow.png", "bubble-right.png", "bubble-top-arrow.png", "bubble-top-left.png", "bubble-top-right.png", "bubble-top.png", "close-button.png"])
        }, 200), SimileAjax.DOM.registerEvent(document.body, "mousedown", SimileAjax.WindowManager._onBodyMouseDown), SimileAjax.DOM.registerEvent(document.body, "mouseup", SimileAjax.WindowManager._onBodyMouseUp), SimileAjax.DOM.registerEvent(document, "keydown", SimileAjax.WindowManager._onBodyKeyDown), SimileAjax.DOM.registerEvent(document, "keyup", SimileAjax.WindowManager._onBodyKeyUp), SimileAjax.WindowManager._layers.push({
            index: 0
        }), SimileAjax.WindowManager._initialized = !0)
    },
    getBaseLayer: function () {
        return SimileAjax.WindowManager.initialize(), SimileAjax.WindowManager._layers[0]
    },
    getHighestLayer: function () {
        return SimileAjax.WindowManager.initialize(), SimileAjax.WindowManager._layers[SimileAjax.WindowManager._layers.length - 1]
    },
    registerEvent: function (n, t, i, r) {
        function u(n, t, u) {
            if (SimileAjax.WindowManager._canProcessEventAtLayer(r)) {
                SimileAjax.WindowManager._popToLayer(r.index);
                try {
                    i(n, t, u)
                } catch (f) {}
            }
            return SimileAjax.DOM.cancelEvent(t), !1
        }
        r == null && (r = SimileAjax.WindowManager.getHighestLayer()), SimileAjax.DOM.registerEvent(n, t, u)
    },
    pushLayer: function (n, t, i) {
        var r = {
            onPop: n,
            index: SimileAjax.WindowManager._layers.length,
            ephemeral: t,
            elmt: i
        };
        return SimileAjax.WindowManager._layers.push(r), r
    },
    popLayer: function (n) {
        for (var t = 1; t < SimileAjax.WindowManager._layers.length; t++)
            if (SimileAjax.WindowManager._layers[t] == n) {
                SimileAjax.WindowManager._popToLayer(t - 1);
                break
            }
    },
    _popToLayer: function (n) {
        while (n + 1 < SimileAjax.WindowManager._layers.length) try {
            var t = SimileAjax.WindowManager._layers.pop();
            t.onPop != null && t.onPop()
        } catch (i) {}
    },
    _canProcessEventAtLayer: function (n) {
        if (n.index == SimileAjax.WindowManager._layers.length - 1) return !0;
        for (var t = n.index + 1; t < SimileAjax.WindowManager._layers.length; t++)
            if (!SimileAjax.WindowManager._layers[t].ephemeral) return !1;
        return !0
    },
    cancelPopups: function (n) {
        for (var r = n ? SimileAjax.DOM.getEventPageCoordinates(n) : {
            x: -1,
            y: -1
        }, t = SimileAjax.WindowManager._layers.length - 1, f, u, i; t > 0 && SimileAjax.WindowManager._layers[t].ephemeral;) {
            if (f = SimileAjax.WindowManager._layers[t], f.elmt != null && (u = f.elmt, i = SimileAjax.DOM.getPageCoordinates(u), r.x >= i.left && r.x < i.left + u.offsetWidth && r.y >= i.top && r.y < i.top + u.offsetHeight)) break;
            t--
        }
        SimileAjax.WindowManager._popToLayer(t)
    },
    _onBodyMouseDown: function (n, t) {
        "eventPhase" in t && t.eventPhase != t.BUBBLING_PHASE || SimileAjax.WindowManager.cancelPopups(t)
    },
    _handleMouseDown: function (n, t, i) {
        return SimileAjax.WindowManager._draggedElement = n, SimileAjax.WindowManager._draggedElementCallback = i, SimileAjax.WindowManager._lastCoords = {
            x: t.clientX,
            y: t.clientY
        }, SimileAjax.DOM.cancelEvent(t), !1
    },
    _onBodyKeyDown: function (n, t) {
        if (SimileAjax.WindowManager._dragging)
            if (t.keyCode == 27) SimileAjax.WindowManager._cancelDragging();
            else if ((t.keyCode == 17 || t.keyCode == 16) && SimileAjax.WindowManager._draggingMode != "copy") {
            SimileAjax.WindowManager._draggingMode = "copy";
            var r = SimileAjax.Graphics.createTranslucentImage(Timeline.urlPrefix + "images/copy.png");
            r.style.position = "absolute", r.style.left = SimileAjax.WindowManager._ghostCoords.left - 16 + "px", r.style.top = SimileAjax.WindowManager._ghostCoords.top + "px", document.body.appendChild(r), SimileAjax.WindowManager._draggingModeIndicatorElmt = r
        }
    },
    _onBodyKeyUp: function (n, t) {
        SimileAjax.WindowManager._dragging && (t.keyCode == 17 || t.keyCode == 16) && (SimileAjax.WindowManager._draggingMode = "", SimileAjax.WindowManager._draggingModeIndicatorElmt != null && (document.body.removeChild(SimileAjax.WindowManager._draggingModeIndicatorElmt), SimileAjax.WindowManager._draggingModeIndicatorElmt = null))
    },
    _onBodyMouseUp: function (n, t, i) {
        var r, u, i;
        if (SimileAjax.WindowManager._draggedElement != null) {
            try {
                if (SimileAjax.WindowManager._dragging && (r = SimileAjax.WindowManager._draggedElementCallback, "onDragEnd" in r && r.onDragEnd(), "droppable" in r && r.droppable)) {
                    if (u = !1, i = SimileAjax.WindowManager._potentialDropTarget, i != null && (!("canDropOn" in r) || r.canDropOn(i)) && (!("canDrop" in i) || i.canDrop(SimileAjax.WindowManager._draggedElement))) {
                        if ("onDropOn" in r) r.onDropOn(i);
                        i.ondrop(SimileAjax.WindowManager._draggedElement, SimileAjax.WindowManager._draggingMode);
                        u = !0
                    }!u
                }
            } finally {
                SimileAjax.WindowManager._cancelDragging()
            }
            return SimileAjax.DOM.cancelEvent(t), !1
        }
    },
    _cancelDragging: function () {
        var n = SimileAjax.WindowManager._draggedElementCallback,
            t;
        "_ghostElmt" in n && (t = n._ghostElmt, document.body.removeChild(t), delete n._ghostElmt), SimileAjax.WindowManager._dropTargetHighlightElement != null && (document.body.removeChild(SimileAjax.WindowManager._dropTargetHighlightElement), SimileAjax.WindowManager._dropTargetHighlightElement = null), SimileAjax.WindowManager._draggingModeIndicatorElmt != null && (document.body.removeChild(SimileAjax.WindowManager._draggingModeIndicatorElmt), SimileAjax.WindowManager._draggingModeIndicatorElmt = null), SimileAjax.WindowManager._draggedElement = null, SimileAjax.WindowManager._draggedElementCallback = null, SimileAjax.WindowManager._potentialDropTarget = null, SimileAjax.WindowManager._dropTargetHighlightElement = null, SimileAjax.WindowManager._lastCoords = null, SimileAjax.WindowManager._ghostCoords = null, SimileAjax.WindowManager._draggingMode = "", SimileAjax.WindowManager._dragging = !1
    },
    _findDropTarget: function (n) {
        while (n != null) {
            if ("ondrop" in n && typeof n.ondrop == "function") break;
            n = n.parentNode
        }
        return n
    }
}, Timeline.GregorianDateLabeller = function (n, t) {
    this._locale = n, this._timeZone = t
}, Timeline.GregorianDateLabeller.monthNames = [], Timeline.GregorianDateLabeller.dayNames = [], Timeline.GregorianDateLabeller.labelIntervalFunctions = [], Timeline.GregorianDateLabeller.getMonthName = function (n, t) {
    return Timeline.GregorianDateLabeller.monthNames[t][n]
}, Timeline.GregorianDateLabeller.prototype.labelInterval = function (n, t) {
    var i = Timeline.GregorianDateLabeller.labelIntervalFunctions[this._locale];
    return i == null && (i = Timeline.GregorianDateLabeller.prototype.defaultLabelInterval), i.call(this, n, t)
}, Timeline.GregorianDateLabeller.prototype.labelPrecise = function (n) {
    return SimileAjax.DateTime.removeTimeZoneOffset(n, this._timeZone).toUTCString()
}, Timeline.GregorianDateLabeller.prototype.defaultLabelInterval = function (n, t) {
    var i, f = !1,
        r, u;
    n = SimileAjax.DateTime.removeTimeZoneOffset(n, this._timeZone);
    switch (t) {
    case SimileAjax.DateTime.MILLISECOND:
        i = n.getUTCMilliseconds();
        break;
    case SimileAjax.DateTime.SECOND:
        i = n.getUTCSeconds();
        break;
    case SimileAjax.DateTime.MINUTE:
        r = n.getUTCMinutes(), r == 0 ? (i = n.getUTCHours() + ":00", f = !0) : i = r;
        break;
    case SimileAjax.DateTime.HOUR:
        i = n.getUTCHours() + "hr";
        break;
    case SimileAjax.DateTime.DAY:
        i = Timeline.GregorianDateLabeller.getMonthName(n.getUTCMonth(), this._locale) + " " + n.getUTCDate();
        break;
    case SimileAjax.DateTime.WEEK:
        i = Timeline.GregorianDateLabeller.getMonthName(n.getUTCMonth(), this._locale) + " " + n.getUTCDate();
        break;
    case SimileAjax.DateTime.MONTH:
        if (r = n.getUTCMonth(), r != 0) {
            i = Timeline.GregorianDateLabeller.getMonthName(r, this._locale);
            break
        }
    case SimileAjax.DateTime.YEAR:
    case SimileAjax.DateTime.DECADE:
    case SimileAjax.DateTime.CENTURY:
    case SimileAjax.DateTime.MILLENNIUM:
        u = n.getUTCFullYear(), i = u > 0 ? n.getUTCFullYear() : 1 - u + "BC", f = t == SimileAjax.DateTime.MONTH || t == SimileAjax.DateTime.DECADE && u % 100 == 0 || t == SimileAjax.DateTime.CENTURY && u % 1e3 == 0;
        break;
    default:
        i = n.toUTCString()
    }
    return {
        text: i,
        emphasized: f
    }
}, Timeline.GregorianDateLabeller.monthNames.en = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], Timeline.GregorianDateLabeller.dayNames.en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], Timeline.strings.en = {
    wikiLinkLabel: "Discuss"
}, Timeline._Band = function (n, t, i) {
    var u = this,
        f, h, s, e, o;
    n.autoWidth && typeof t.width == "string" && (t.width = t.width.indexOf("%") > -1 ? 0 : parseInt(t.width)), this._timeline = n, this._bandInfo = t, this._index = i, this._locale = "locale" in t ? t.locale : Timeline.getDefaultLocale(), this._timeZone = "timeZone" in t ? t.timeZone : 0, this._labeller = "labeller" in t ? t.labeller : "createLabeller" in n.getUnit() ? n.getUnit().createLabeller(this._locale, this._timeZone) : new Timeline.GregorianDateLabeller(this._locale, this._timeZone), this._theme = t.theme, this._zoomIndex = "zoomIndex" in t ? t.zoomIndex : 0, this._zoomSteps = "zoomSteps" in t ? t.zoomSteps : null, this._dragging = !1, this._changing = !1, this._originalScrollSpeed = 5, this._scrollSpeed = this._originalScrollSpeed, this._onScrollListeners = [], this._orthogonalDragging = !1, this._viewOrthogonalOffset = 0, this._onOrthogonalScrollListeners = [], f = this, this._syncWithBand = null, this._syncWithBandHandler = function () {
        f._onHighlightBandScroll()
    }, this._syncWithBandOrthogonalScrollHandler = function () {
        f._onHighlightBandOrthogonalScroll()
    }, this._selectorListener = function () {
        f._onHighlightBandScroll()
    }, h = $("<div class='timeline-band-input'/>").appendTo(this._timeline.getContainer()), this._keyboardInput = $("<div class='timeline-band-nofocus' tabindex='-1' /><input type='text'/>").appendTo(h).on("keydown", function (n) {
        u._onKeyDown(n)
    }).on("keyup", function (n) {
        u._onKeyUp(n)
    }), this._div = this._timeline.getDocument().createElement("div"), this._div.id = "timeline-band-" + i, this._div.className = "timeline-band timeline-band-" + i, this._timeline.addDiv(this._div);
    $(this._div).on("dblclick", function (n) {
        u._onDblClick(n)
    });
    $(this._div).on("mousedown", function (n) {
        u._onMouseDown(n)
    });
    $(this._div).on("touchstart", function (n) {
        u._onTouchStart(n)
    });
    $(this._div).on("touchmove", function (n) {
        u._onTouchMove(n)
    });
    $(this._div).on("click", function (n) {
        n.srcElement.tagName == "IMG" || $(n.srcElement).hasClass("timeline-event-label") || u._keyboardInput.get(1).focus()
    });
    $("body").on("mousemove", function (n) {
        u._onMouseMove(n)
    });
    $("body").on("mouseout", function (n) {
        u._onMouseOut(n)
    });
    $("body").on("mouseup", function (n) {
        u._onMouseUp(n)
    });
    if (s = this._theme != null ? this._theme.mouseWheel : "scroll", s === "zoom" || s === "scroll" || this._zoomSteps)
        if (SimileAjax.Platform.browser.isFirefox) $(this._div).on("DOMMouseScroll", function (n) {
            u._onMouseScroll(n)
        });
        else $(this._div).on("mousewheel", function (n) {
            u._onMouseScroll(n)
        });
    for (this._innerDiv = this._timeline.getDocument().createElement("div"), this._innerDiv.className = "timeline-band-inner", this._div.appendChild(this._innerDiv), this._ether = t.ether, t.ether.initialize(this, n), this._etherPainter = t.etherPainter, t.etherPainter.initialize(this, n), this._eventSource = t.eventSource, this._eventSource && (this._eventListener = {
        onAddMany: function () {
            f._onAddMany()
        },
        onClear: function () {
            f._onClear()
        }
    }, this._eventSource.addListener(this._eventListener)), this._eventPainter = t.eventPainter, this._eventTracksNeeded = 0, this._eventTrackIncrement = 0, t.eventPainter.initialize(this, n), this._decorators = ("decorators" in t) ? t.decorators : [], e = 0; e < this._decorators.length; e++) this._decorators[e].initialize(this, n);
    if (this._supportsOrthogonalScrolling = "supportsOrthogonalScrolling" in this._eventPainter && this._eventPainter.supportsOrthogonalScrolling(), this._supportsOrthogonalScrolling) {
        this._scrollBar = this._timeline.getDocument().createElement("div"), this._scrollBar.id = "timeline-band-scrollbar-" + i, this._scrollBar.className = "timeline-band-scrollbar", this._timeline.addDiv(this._scrollBar), this._scrollBar.innerHTML = '<div class="timeline-band-scrollbar-thumb"> <\/div>', o = this._scrollBar.firstChild, o.style.cursor = SimileAjax.Platform.browser.isIE ? "move" : "-moz-grab";
        $(o).on("mousedown", function (n) {
            r._onScrollBarMouseDown(n)
        })
    }
}, Timeline._Band.SCROLL_MULTIPLES = 5, $.extend(Timeline._Band.prototype, {
    dispose: function () {
        this.closeBubble(), this._eventSource && (this._eventSource.removeListener(this._eventListener), this._eventListener = null, this._eventSource = null), this._timeline = null, this._bandInfo = null, this._labeller = null, this._ether = null, this._etherPainter = null, this._eventPainter = null, this._decorators = null, this._onScrollListeners = null, this._syncWithBandHandler = null, this._syncWithBandOrthogonalScrollHandler = null, this._selectorListener = null, this._div = null, this._innerDiv = null, this._keyboardInput = null, this._scrollBar = null
    },
    addOnScrollListener: function (n) {
        this._onScrollListeners.push(n)
    },
    removeOnScrollListener: function (n) {
        for (var t = 0; t < this._onScrollListeners.length; t++)
            if (this._onScrollListeners[t] == n) {
                this._onScrollListeners.splice(t, 1);
                break
            }
    },
    addOnOrthogonalScrollListener: function (n) {
        this._onOrthogonalScrollListeners.push(n)
    },
    removeOnOrthogonalScrollListener: function (n) {
        for (var t = 0; t < this._onOrthogonalScrollListeners.length; t++)
            if (this._onOrthogonalScrollListeners[t] == n) {
                this._onOrthogonalScrollListeners.splice(t, 1);
                break
            }
    },
    setSyncWithBand: function (n, t) {
        this._syncWithBand && (this._syncWithBand.removeOnScrollListener(this._syncWithBandHandler), this._syncWithBand.removeOnOrthogonalScrollListener(this._syncWithBandOrthogonalScrollHandler)), this._syncWithBand = n, this._syncWithBand.addOnScrollListener(this._syncWithBandHandler), this._syncWithBand.addOnOrthogonalScrollListener(this._syncWithBandOrthogonalScrollHandler), this._highlight = t, this._positionHighlight()
    },
    getLocale: function () {
        return this._locale
    },
    getTimeZone: function () {
        return this._timeZone
    },
    getLabeller: function () {
        return this._labeller
    },
    getIndex: function () {
        return this._index
    },
    getEther: function () {
        return this._ether
    },
    getEtherPainter: function () {
        return this._etherPainter
    },
    getEventSource: function () {
        return this._eventSource
    },
    getEventPainter: function () {
        return this._eventPainter
    },
    getTimeline: function () {
        return this._timeline
    },
    updateEventTrackInfo: function (n, t) {
        this._eventTrackIncrement = t, n > this._eventTracksNeeded && (this._eventTracksNeeded = n)
    },
    checkAutoWidth: function () {
        var t;
        if (this._timeline.autoWidth) {
            var i = this._eventPainter.getType() == "overview",
                r = i ? this._theme.event.overviewTrack.autoWidthMargin : this._theme.event.track.autoWidthMargin,
                n = Math.ceil((this._eventTracksNeeded + r) * this._eventTrackIncrement);
            n += i ? this._theme.event.overviewTrack.offset : this._theme.event.track.offset, t = this._bandInfo, n != t.width && (t.width = n)
        }
    },
    layout: function () {
        this.paint()
    },
    paint: function () {
        this._etherPainter.paint(), this._paintDecorators(), this._paintEvents()
    },
    softLayout: function () {
        this.softPaint()
    },
    softPaint: function () {
        this._etherPainter.softPaint(), this._softPaintDecorators(), this._softPaintEvents()
    },
    setBandShiftAndWidth: function (n, t) {
        var i = this._keyboardInput.parent()[0],
            r = n + Math.floor(t / 2);
        this._timeline.isHorizontal() ? (this._div.style.top = n + "px", this._div.style.height = t + "px", i.style.top = r + "px", i.style.left = "-1em") : (this._div.style.left = n + "px", this._div.style.width = t + "px", i.style.left = r + "px", i.style.top = "-1em")
    },
    getViewWidth: function () {
        return this._timeline.isHorizontal() ? this._div.offsetHeight : this._div.offsetWidth
    },
    setViewLength: function (n) {
        this._viewLength = n, this._recenterDiv(), this._onChanging()
    },
    getViewLength: function () {
        return this._viewLength
    },
    getTotalViewLength: function () {
        return Timeline._Band.SCROLL_MULTIPLES * this._viewLength
    },
    getViewOffset: function () {
        return this._viewOffset
    },
    getMinDate: function () {
        return this._ether.pixelOffsetToDate(this._viewOffset)
    },
    getMaxDate: function () {
        return this._ether.pixelOffsetToDate(this._viewOffset + Timeline._Band.SCROLL_MULTIPLES * this._viewLength)
    },
    getMinVisibleDate: function () {
        return this._ether.pixelOffsetToDate(0)
    },
    getMinVisibleDateAfterDelta: function (n) {
        return this._ether.pixelOffsetToDate(n)
    },
    getMaxVisibleDate: function () {
        return this._ether.pixelOffsetToDate(this._viewLength)
    },
    getMaxVisibleDateAfterDelta: function (n) {
        return this._ether.pixelOffsetToDate(this._viewLength + n)
    },
    getCenterVisibleDate: function () {
        return this._ether.pixelOffsetToDate(this._viewLength / 2)
    },
    setMinVisibleDate: function (n) {
        this._changing || this._moveEther(Math.round(-this._ether.dateToPixelOffset(n)))
    },
    setMaxVisibleDate: function (n) {
        this._changing || this._moveEther(Math.round(this._viewLength - this._ether.dateToPixelOffset(n)))
    },
    setCenterVisibleDate: function (n) {
        this._changing || this._moveEther(Math.round(this._viewLength / 2 - this._ether.dateToPixelOffset(n)))
    },
    dateToPixelOffset: function (n) {
        return this._ether.dateToPixelOffset(n) - this._viewOffset
    },
    pixelOffsetToDate: function (n) {
        return this._ether.pixelOffsetToDate(n + this._viewOffset)
    },
    getViewOrthogonalOffset: function () {
        return this._viewOrthogonalOffset
    },
    setViewOrthogonalOffset: function (n) {
        this._viewOrthogonalOffset = Math.max(0, n)
    },
    createLayerDiv: function (n, t) {
        var i = $("<div classname='" + t + " timeline-band-layer' style='z-index:" + n + "'/>").appendTo(this._innerDiv),
            r = $("<div className='timeline-band-layer-inner' style='cursor:" + (SimileAjax.Platform.browser.isIE ? "move" : "-moz-grab") + "'/>").appendTo(i);
        return r.hide()
    },
    removeLayerDiv: function (n) {
        this._innerDiv.removeChild(n.parentNode)
    },
    scrollToCenter: function (n, t) {
        var i = this._ether.dateToPixelOffset(n);
        i < -this._viewLength / 2 ? this.setCenterVisibleDate(this.pixelOffsetToDate(i + this._viewLength)) : i > 3 * this._viewLength / 2 && this.setCenterVisibleDate(this.pixelOffsetToDate(i - this._viewLength)), this._autoScroll(Math.round(this._viewLength / 2 - this._ether.dateToPixelOffset(n)), t)
    },
    showBubbleForEvent: function (n) {
        var t = this.getEventSource().getEvent(n),
            i;
        t && (i = this, this.scrollToCenter(t.getStart(), function () {
            i._eventPainter.showBubble(t)
        }))
    },
    zoom: function (n, t) {
        if (this._zoomSteps) {
            t += this._viewOffset;
            var u = this._ether.pixelOffsetToDate(t),
                f = this._ether.zoom(n);
            this._etherPainter.zoom(f), this._moveEther(Math.round(-this._ether.dateToPixelOffset(u))), this._moveEther(t)
        }
    },
    _onMouseDown: function (n) {
        if (!this._dragging) return this.closeBubble(), this._dragging = !0, this._dragX = n.clientX, this._dragY = n.clientY, this._cancelEvent(n)
    },
    _onMouseMove: function (n) {
        var t, i, r, u;
        if ((this._dragging || this._orthogonalDragging) && (t = n.clientX - this._dragX, i = n.clientY - this._dragY, this._dragX = n.clientX, this._dragY = n.clientY), this._dragging) this._timeline.isHorizontal() ? this._moveEther(t, i) : this._moveEther(i, t);
        else if (this._orthogonalDragging) r = this.getViewWidth(), u = this._scrollBar.firstChild, this._timeline.isHorizontal() ? this._moveEther(0, -i * r / u.offsetHeight) : this._moveEther(0, -t * r / u.offsetWidth);
        else return;
        return this._positionHighlight(), this._showScrollbar(), this._cancelEvent(n)
    },
    _onMouseUp: function (n) {
        if (this._dragging) this._dragging = !1;
        else if (this._orthogonalDragging) this._orthogonalDragging = !1;
        else return;
        return this._keyboardInput.focus(), this._bounceBack(), this._cancelEvent(n)
    },
    _onMouseOut: function (n) {
        if (n.toElement == null || n.toElement.tagName == "HTML") {
            if (this._dragging) this._dragging = !1;
            else if (this._orthogonalDragging) this._orthogonalDragging = !1;
            else return;
            return this._bounceBack(), this._cancelEvent(n)
        }
    },
    _onScrollBarMouseDown: function (n) {
        if (!this._orthogonalDragging) return this.closeBubble(), this._orthogonalDragging = !0, this._dragX = n.clientX, this._dragY = n.clientY, this._cancelEvent(n)
    },
    _onMouseScroll: function (n) {
        var r = new Date,
            t = n.originalEvent,
            i, u, f, e, o;
        r = r.getTime(), (!this._lastScrollTime || r - this._lastScrollTime > 50) && (this._lastScrollTime = r, i = 0, t.wheelDelta ? i = t.wheelDelta / 120 : t.detail && (i = -t.detail / 3), u = this._theme.mouseWheel, this._zoomSteps || u === "zoom" ? (f = SimileAjax.DOM.getEventRelativeCoordinates(t, innerFrame), i != 0 && (i > 0 && (e = !0), i < 0 && (e = !1), this._timeline.zoom(e, f.x, f.y, innerFrame))) : u === "scroll" && (o = 50 * (i < 0 ? -1 : 1), this._moveEther(o))), t.stopPropagation && t.stopPropagation(), t.cancelBubble = !0, t.preventDefault && t.preventDefault(), t.returnValue = !1
    },
    _onDblClick: function (n) {
        var t = n.srcElement ? n.srcElement : n.target,
            i, r;
        ($(t).hasClass("timeline-band-inner") || (t = $(t).parents(".timeline-band-inner").get(0))) && (i = SimileAjax.DOM.getEventRelativeCoordinates(n.originalEvent, t), r = i.x - (this._viewLength / 2 - this._viewOffset), this._autoScroll(-r))
    },
    _onKeyDown: function (n) {
        if (!this._dragging) {
            switch (n.keyCode) {
            case 27:
                break;
            case 37:
            case 38:
                this._scrollSpeed = Math.min(50, Math.abs(this._scrollSpeed * 1.05)), this._moveEther(this._scrollSpeed);
                break;
            case 39:
            case 40:
                this._scrollSpeed = -Math.min(50, Math.abs(this._scrollSpeed * 1.05)), this._moveEther(this._scrollSpeed);
                break;
            default:
                return !0
            }
            return this.closeBubble(), SimileAjax.DOM.cancelEvent(n), !1
        }
        return !0
    },
    _onKeyUp: function (n) {
        if (!this._dragging) {
            this._scrollSpeed = this._originalScrollSpeed;
            switch (n.keyCode) {
            case 35:
                this.setCenterVisibleDate(this._eventSource.getLatestDate());
                break;
            case 36:
                this.setCenterVisibleDate(this._eventSource.getEarliestDate());
                break;
            case 33:
                this._autoScroll(this._timeline.getPixelLength());
                break;
            case 34:
                this._autoScroll(-this._timeline.getPixelLength());
                break;
            default:
                return !0
            }
            return this.closeBubble(), SimileAjax.DOM.cancelEvent(n), !1
        }
        return !0
    },
    _autoScroll: function (n, t) {
        var i = this,
            r = SimileAjax.Graphics.createAnimation(function (n, t) {
                i._moveEther(t)
            }, 0, n, 1e3, t);
        r.run()
    },
    _moveEther: function (n, t) {
        (t === undefined && (t = 0), this.closeBubble(), this._timeline.shiftOK(this._index, n)) && (this._viewOffset += n, this._ether.shiftPixels(-n), this._timeline.isHorizontal() ? this._div.style.left = this._viewOffset + "px" : this._div.style.top = this._viewOffset + "px", this._supportsOrthogonalScrolling && (this._viewOrthogonalOffset = this._eventPainter.getOrthogonalExtent() <= this.getViewWidth() ? 0 : this._viewOrthogonalOffset + t), this._viewOffset > -this._viewLength * .5 || this._viewOffset < -this._viewLength * (Timeline._Band.SCROLL_MULTIPLES - 1.5) ? this._recenterDiv() : this.softLayout(), this._onChanging())
    },
    _onChanging: function () {
        this._changing = !0, this._fireOnScroll(), this._setSyncWithBandDate(), this._changing = !1
    },
    busy: function () {
        return this._changing
    },
    _fireOnScroll: function () {
        for (var n = 0; n < this._onScrollListeners.length; n++) this._onScrollListeners[n](this)
    },
    _fireOnOrthogonalScroll: function () {
        for (var n = 0; n < this._onOrthogonalScrollListeners.length; n++) this._onOrthogonalScrollListeners[n](this)
    },
    _setSyncWithBandDate: function () {
        if (this._syncWithBand) {
            var n = this._ether.pixelOffsetToDate(this.getViewLength() / 2);
            this._syncWithBand.setCenterVisibleDate(n)
        }
    },
    _onHighlightBandScroll: function () {
        if (this._syncWithBand) {
            var n = this._syncWithBand.getCenterVisibleDate(),
                t = this._ether.dateToPixelOffset(n);
            this._moveEther(Math.round(this._viewLength / 2 - t)), this._positionHighlight()
        }
    },
    _onHighlightBandOrthogonalScroll: function () {
        this._syncWithBand && this._positionHighlight()
    },
    _onAddMany: function () {
        this._paintEvents()
    },
    _onClear: function () {
        this._paintEvents()
    },
    _positionHighlight: function () {
        var t, i;
        if (this._syncWithBand && (t = this._syncWithBand.getMinVisibleDate(), i = this._syncWithBand.getMaxVisibleDate(), this._highlight)) {
            var r = 0,
                u = 1,
                n = this._syncWithBand.getEventPainter();
            if ("supportsOrthogonalScrolling" in n && n.supportsOrthogonalScrolling()) {
                var o = n.getOrthogonalExtent(),
                    f = this._syncWithBand.getViewWidth(),
                    e = Math.max(f, o);
                u = f / e, r = -this._syncWithBand.getViewOrthogonalOffset() / e
            }
            this._etherPainter.setHighlight(t, i, r, u)
        }
    },
    _recenterDiv: function () {
        this._viewOffset = -this._viewLength * (Timeline._Band.SCROLL_MULTIPLES - 1) / 2, this._timeline.isHorizontal() ? (this._div.style.left = this._viewOffset + "px", this._div.style.width = Timeline._Band.SCROLL_MULTIPLES * this._viewLength + "px") : (this._div.style.top = this._viewOffset + "px", this._div.style.height = Timeline._Band.SCROLL_MULTIPLES * this._viewLength + "px"), this.layout()
    },
    _paintEvents: function () {
        this._eventPainter.paint(), this._showScrollbar(), this._fireOnOrthogonalScroll()
    },
    _softPaintEvents: function () {
        this._eventPainter.softPaint()
    },
    _paintDecorators: function () {
        for (var n = 0; n < this._decorators.length; n++) this._decorators[n].paint()
    },
    _softPaintDecorators: function () {
        for (var n = 0; n < this._decorators.length; n++) this._decorators[n].softPaint()
    },
    closeBubble: function () {
        SimileAjax.WindowManager.cancelPopups()
    },
    _bounceBack: function () {
        var i, r, t;
        this._supportsOrthogonalScrolling && (i = 0, this._viewOrthogonalOffset < 0 && (r = this._eventPainter.getOrthogonalExtent(), i = this._viewOrthogonalOffset + r >= this.getViewWidth() ? this._viewOrthogonalOffset : Math.min(0, this.getViewWidth() - r)), i != this._viewOrthogonalOffset ? (t = this, SimileAjax.Graphics.createAnimation(function (n) {
            t._viewOrthogonalOffset = n, t._eventPainter.softPaint(), t._showScrollbar(), t._fireOnOrthogonalScroll()
        }, this._viewOrthogonalOffset, i, 300, function () {
            t._hideScrollbar()
        }).run()) : this._hideScrollbar())
    },
    _showScrollbar: function () {
        if (this._supportsOrthogonalScrolling) {
            var e = this._eventPainter.getOrthogonalExtent(),
                t = this.getViewWidth(),
                o = Math.max(t, e),
                i = t / o,
                r = Math.round(t * i) + "px",
                u = Math.round(-this._viewOrthogonalOffset * i) + "px",
                f = 12,
                n = this._scrollBar.firstChild;
            this._timeline.isHorizontal() ? (this._scrollBar.style.top = this._div.style.top, this._scrollBar.style.height = this._div.style.height, this._scrollBar.style.right = "0px", this._scrollBar.style.width = f + "px", n.style.top = u, n.style.height = r) : (this._scrollBar.style.left = this._div.style.left, this._scrollBar.style.width = this._div.style.width, this._scrollBar.style.bottom = "0px", this._scrollBar.style.height = f + "px", n.style.left = u, n.style.width = r), this._scrollBar.style.display = i >= 1 && this._viewOrthogonalOffset == 0 ? "none" : "block"
        }
    },
    _hideScrollbar: function () {
        !this._supportsOrthogonalScrolling
    },
    _cancelEvent: function (n) {
        return SimileAjax.DOM.cancelEvent(n), !1
    }
}), Timeline.SpanHighlightDecorator = function (n) {
    this._unit = n.unit != null ? n.unit : SimileAjax.NativeDateUnit, this._startDate = typeof n.startDate == "string" ? this._unit.parseFromObject(n.startDate) : n.startDate, this._endDate = typeof n.endDate == "string" ? this._unit.parseFromObject(n.endDate) : n.endDate, this._startLabel = n.startLabel != null ? n.startLabel : "", this._endLabel = n.endLabel != null ? n.endLabel : "", this._color = n.color, this._cssClass = n.cssClass != null ? n.cssClass : null, this._opacity = n.opacity != null ? n.opacity : 100, this._zIndex = n.inFront != null && n.inFront ? 113 : 10
}, $.extend(Timeline.SpanHighlightDecorator.prototype, {
    initialize: function (n, t) {
        this._band = n, this._timeline = t, this._layerDiv = null
    },
    paint: function () {
        var u, f, t, o, i, s;
        if (this._layerDiv != null && this._band.removeLayerDiv(this._layerDiv), this._layerDiv = this._band.createLayerDiv(this._zIndex).get(0), u = this._band.getMinDate(), f = this._band.getMaxDate(), this._unit.compare(this._startDate, f) < 0 && this._unit.compare(this._endDate, u) > 0) {
            u = this._unit.later(u, this._startDate), f = this._unit.earlier(f, this._endDate);
            var r = this._band.dateToPixelOffset(u),
                e = this._band.dateToPixelOffset(f),
                h = this._timeline.getDocument(),
                c = function () {
                    var n = h.createElement("table");
                    return n.insertRow(0).insertCell(0), n
                }, n = h.createElement("div");
            n.className = "timeline-highlight-decorator", this._cssClass && (n.className += " " + this._cssClass), this._color != null && (n.style.backgroundColor = this._color), this._opacity < 100 && SimileAjax.Graphics.setOpacity(n, this._opacity), this._layerDiv.appendChild(n), t = c(), t.className = "timeline-highlight-label timeline-highlight-label-start", o = t.rows[0].cells[0], o.innerHTML = this._startLabel, this._cssClass && (o.className = "label_" + this._cssClass), this._layerDiv.appendChild(t), i = c(), i.className = "timeline-highlight-label timeline-highlight-label-end", s = i.rows[0].cells[0], s.innerHTML = this._endLabel, this._cssClass && (s.className = "label_" + this._cssClass), this._layerDiv.appendChild(i), this._timeline.isHorizontal() ? (n.style.left = r + "px", n.style.width = e - r + "px", t.style.right = this._band.getTotalViewLength() - r + "px", t.style.width = this._startLabel.length + "em", i.style.left = e + "px", i.style.width = this._endLabel.length + "em") : (n.style.top = r + "px", n.style.height = e - r + "px", t.style.bottom = r + "px", t.style.height = "1.5px", i.style.top = e + "px", i.style.height = "1.5px")
        }
        this._layerDiv.style.display = "block"
    },
    softPaint: function () {}
}), Timeline.PointHighlightDecorator = function (n) {
    this._unit = n.unit != null ? n.unit : SimileAjax.NativeDateUnit, this._date = typeof n.date == "string" ? this._unit.parseFromObject(n.date) : n.date, this._width = n.width != null ? n.width : 10, this._color = n.color, this._cssClass = n.cssClass != null ? n.cssClass : "", this._opacity = n.opacity != null ? n.opacity : 100
}, $.extend(Timeline.PointHighlightDecorator.prototype, {
    initialize: function (n, t) {
        this._band = n, this._timeline = t, this._layerDiv = null
    },
    paint: function () {
        var t, i;
        if (this._layerDiv != null && this._band.removeLayerDiv(this._layerDiv), this._layerDiv = $(this._band.createLayerDiv(10)).show().get(0), t = this._band.getMinDate(), i = this._band.getMaxDate(), this._unit.compare(this._date, i) < 0 && this._unit.compare(this._date, t) > 0) {
            var u = this._band.dateToPixelOffset(this._date),
                r = u - Math.round(this._width / 2),
                f = this._timeline.getDocument(),
                n = f.createElement("div");
            n.className = "timeline-highlight-point-decorator", n.className += " " + this._cssClass, this._color != null && (n.style.backgroundColor = this._color), this._opacity < 100 && SimileAjax.Graphics.setOpacity(n, this._opacity), this._layerDiv.appendChild(n), this._timeline.isHorizontal() ? (n.style.left = r + "px", n.style.width = this._width + "px") : (n.style.top = r + "px", n.style.height = this._width + "px")
        }
        this._layerDiv.style.display = "block"
    },
    softPaint: function () {}
}), Timeline.GregorianEtherPainter = function (n) {
    this._params = n, this._theme = n.theme, this._unit = n.unit, this._multiple = "multiple" in n ? n.multiple : 1
}, $.extend(Timeline.GregorianEtherPainter.prototype, {
    initialize: function (n, t) {
        this._band = n, this._timeline = t, this._backgroundLayer = n.createLayerDiv(0).addClass("timeline-ether-bg").show().get(0), this._markerLayer = null, this._lineLayer = null;
        var i = "align" in this._params && this._params.align != undefined ? this._params.align : this._theme.ether.interval.marker[t.isHorizontal() ? "hAlign" : "vAlign"],
            r = "showLine" in this._params ? this._params.showLine : this._theme.ether.interval.line.show;
        this._intervalMarkerLayout = new Timeline.EtherIntervalMarkerLayout(this._timeline, this._band, this._theme, i, r), this._highlight = new Timeline.EtherHighlight(this._timeline, this._band, this._theme, this._backgroundLayer)
    },
    setHighlight: function (n, t, i, r) {
        this._highlight.position(n, t, i, r)
    },
    paint: function () {
        var t, i;
        this._markerLayer && this._band.removeLayerDiv(this._markerLayer), this._markerLayer = this._band.createLayerDiv(100).get(0), this._lineLayer && this._band.removeLayerDiv(this._lineLayer), this._lineLayer = this._band.createLayerDiv(1).get(0);
        var n = this._band.getMinDate(),
            r = this._band.getMaxDate(),
            u = this._band.getTimeZone(),
            f = this._band.getLabeller();
        for (SimileAjax.DateTime.roundDownToInterval(n, this._unit, u, this._multiple, this._theme.firstDayOfWeek), t = this, i = function (n) {
            for (var i = 0; i < t._multiple; i++) SimileAjax.DateTime.incrementByInterval(n, t._unit)
        }; n.getTime() < r.getTime();) this._intervalMarkerLayout.createIntervalMarker(n, f, this._unit, this._markerLayer, this._lineLayer), i(n);
        this._markerLayer.style.display = "block", this._lineLayer.style.display = "block"
    },
    softPaint: function () {},
    zoom: function (n) {
        n != 0 && (this._unit += n)
    }
}), Timeline.HotZoneGregorianEtherPainter = function (n) {
    var e, r, t;
    for (this._params = n, this._theme = n.theme, this._zones = [{
        startTime: Number.NEGATIVE_INFINITY,
        endTime: Number.POSITIVE_INFINITY,
        unit: n.unit,
        multiple: 1
    }], e = 0; e < n.zones.length; e++) {
        var u = n.zones[e],
            i = SimileAjax.DateTime.parseGregorianDateTime(u.start).getTime(),
            f = SimileAjax.DateTime.parseGregorianDateTime(u.end).getTime();
        for (r = 0; r < this._zones.length && f > i; r++) t = this._zones[r], i < t.endTime && (i > t.startTime && (this._zones.splice(r, 0, {
            startTime: t.startTime,
            endTime: i,
            unit: t.unit,
            multiple: t.multiple
        }), r++, t.startTime = i), f < t.endTime ? (this._zones.splice(r, 0, {
            startTime: i,
            endTime: f,
            unit: u.unit,
            multiple: u.multiple ? u.multiple : 1
        }), r++, t.startTime = f, i = f) : (t.multiple = u.multiple, t.unit = u.unit, i = t.endTime))
    }
}, $.extend(Timeline.HotZoneGregorianEtherPainter.prototype, {
    initialize: function (n, t) {
        this._band = n, this._timeline = t, this._backgroundLayer = n.createLayerDiv(0).addClass("timeline-ether-bg").show().get(0), this._markerLayer = null, this._lineLayer = null;
        var i = "align" in this._params && this._params.align != undefined ? this._params.align : this._theme.ether.interval.marker[t.isHorizontal() ? "hAlign" : "vAlign"],
            r = "showLine" in this._params ? this._params.showLine : this._theme.ether.interval.line.show;
        this._intervalMarkerLayout = new Timeline.EtherIntervalMarkerLayout(this._timeline, this._band, this._theme, i, r), this._highlight = new Timeline.EtherHighlight(this._timeline, this._band, this._theme, this._backgroundLayer)
    },
    setHighlight: function (n, t) {
        this._highlight.position(n, t)
    },
    paint: function () {
        var t, r;
        this._markerLayer && this._band.removeLayerDiv(this._markerLayer), this._markerLayer = this._band.createLayerDiv(100).get(0), this._lineLayer && this._band.removeLayerDiv(this._lineLayer), this._lineLayer = this._band.createLayerDiv(1).get(0);
        for (var f = this._band.getMinDate(), e = this._band.getMaxDate(), o = this._band.getTimeZone(), h = this._band.getLabeller(), l = this, c = function (n, t) {
                for (var i = 0; i < t.multiple; i++) SimileAjax.DateTime.incrementByInterval(n, t.unit)
            }, i = 0; i < this._zones.length;) {
            if (f.getTime() < this._zones[i].endTime) break;
            i++
        }
        for (t = this._zones.length - 1; t >= 0;) {
            if (e.getTime() > this._zones[t].startTime) break;
            t--
        }
        for (r = i; r <= t; r++) {
            var n = this._zones[r],
                u = new Date(Math.max(f.getTime(), n.startTime)),
                s = new Date(Math.min(e.getTime(), n.endTime));
            for (SimileAjax.DateTime.roundDownToInterval(u, n.unit, o, n.multiple, this._theme.firstDayOfWeek), SimileAjax.DateTime.roundUpToInterval(s, n.unit, o, n.multiple, this._theme.firstDayOfWeek); u.getTime() < s.getTime();) this._intervalMarkerLayout.createIntervalMarker(u, h, n.unit, this._markerLayer, this._lineLayer), c(u, n)
        }
        this._markerLayer.style.display = "block", this._lineLayer.style.display = "block"
    },
    softPaint: function () {},
    zoom: function (n) {
        if (n != 0)
            for (var t = 0; t < this._zones.length; ++t) this._zones[t] && (this._zones[t].unit += n)
    }
}), Timeline.YearCountEtherPainter = function (n) {
    this._params = n, this._theme = n.theme, this._startDate = SimileAjax.DateTime.parseGregorianDateTime(n.startDate), this._multiple = "multiple" in n ? n.multiple : 1
}, $.extend(Timeline.YearCountEtherPainter.prototype, {
    initialize: function (n, t) {
        this._band = n, this._timeline = t, this._backgroundLayer = n.createLayerDiv(0).addClass("timeline-ether-bg").show().get(0), this._markerLayer = null, this._lineLayer = null;
        var i = "align" in this._params ? this._params.align : this._theme.ether.interval.marker[t.isHorizontal() ? "hAlign" : "vAlign"],
            r = "showLine" in this._params ? this._params.showLine : this._theme.ether.interval.line.show;
        this._intervalMarkerLayout = new Timeline.EtherIntervalMarkerLayout(this._timeline, this._band, this._theme, i, r), this._highlight = new Timeline.EtherHighlight(this._timeline, this._band, this._theme, this._backgroundLayer)
    },
    setHighlight: function (n, t) {
        this._highlight.position(n, t)
    },
    paint: function () {
        this._markerLayer && this._band.removeLayerDiv(this._markerLayer), this._markerLayer = this._band.createLayerDiv(100).get(0), this._lineLayer && this._band.removeLayerDiv(this._lineLayer), this._lineLayer = this._band.createLayerDiv(1).get(0);
        var n = new Date(this._startDate.getTime()),
            i = this._band.getMaxDate(),
            r = this._band.getMinDate().getUTCFullYear() - this._startDate.getUTCFullYear();
        n.setUTCFullYear(this._band.getMinDate().getUTCFullYear() - r % this._multiple);
        for (var t = this, u = function (n) {
                for (var i = 0; i < t._multiple; i++) SimileAjax.DateTime.incrementByInterval(n, SimileAjax.DateTime.YEAR)
            }, f = {
                labelInterval: function (n) {
                    var r = n.getUTCFullYear() - t._startDate.getUTCFullYear();
                    return {
                        text: r,
                        emphasized: r == 0
                    }
                }
            }; n.getTime() < i.getTime();) this._intervalMarkerLayout.createIntervalMarker(n, f, SimileAjax.DateTime.YEAR, this._markerLayer, this._lineLayer), u(n);
        this._markerLayer.style.display = "block", this._lineLayer.style.display = "block"
    },
    softPaint: function () {}
}), Timeline.QuarterlyEtherPainter = function (n) {
    this._params = n, this._theme = n.theme, this._startDate = SimileAjax.DateTime.parseGregorianDateTime(n.startDate)
}, $.extend(Timeline.QuarterlyEtherPainter.prototype, {
    initialize: function (n, t) {
        this._band = n, this._timeline = t, this._backgroundLayer = n.createLayerDiv(0).addClass("timeline-ether-bg").show().get(0), this._markerLayer = null, this._lineLayer = null;
        var i = "align" in this._params ? this._params.align : this._theme.ether.interval.marker[t.isHorizontal() ? "hAlign" : "vAlign"],
            r = "showLine" in this._params ? this._params.showLine : this._theme.ether.interval.line.show;
        this._intervalMarkerLayout = new Timeline.EtherIntervalMarkerLayout(this._timeline, this._band, this._theme, i, r), this._highlight = new Timeline.EtherHighlight(this._timeline, this._band, this._theme, this._backgroundLayer)
    },
    setHighlight: function (n, t) {
        this._highlight.position(n, t)
    },
    paint: function () {
        var n, t;
        this._markerLayer && this._band.removeLayerDiv(this._markerLayer), this._markerLayer = this._band.createLayerDiv(100).get(0), this._lineLayer && this._band.removeLayerDiv(this._lineLayer), this._lineLayer = this._band.createLayerDiv(1).get(0), n = new Date(0), t = this._band.getMaxDate(), n.setUTCFullYear(Math.max(this._startDate.getUTCFullYear(), this._band.getMinDate().getUTCFullYear())), n.setUTCMonth(this._startDate.getUTCMonth());
        for (var i = this, r = function (n) {
                n.setUTCMonth(n.getUTCMonth() + 3)
            }, u = {
                labelInterval: function (n) {
                    var r = (4 + (n.getUTCMonth() - i._startDate.getUTCMonth()) / 3) % 4;
                    return r != 0 ? {
                        text: "Q" + (r + 1),
                        emphasized: !1
                    } : {
                        text: "Y" + (n.getUTCFullYear() - i._startDate.getUTCFullYear() + 1),
                        emphasized: !0
                    }
                }
            }; n.getTime() < t.getTime();) this._intervalMarkerLayout.createIntervalMarker(n, u, SimileAjax.DateTime.YEAR, this._markerLayer, this._lineLayer), r(n);
        this._markerLayer.style.display = "block", this._lineLayer.style.display = "block"
    },
    softPaint: function () {}
}), $.extend(Timeline, {
    EtherIntervalMarkerLayout: function (n, t, i, r, u) {
        var f = n.isHorizontal();
        this.positionDiv = f ? r == "Top" ? function (n, t) {
            n.style.left = t + "px", n.style.top = "0px"
        } : function (n, t) {
            n.style.left = t + "px", n.style.bottom = "0px"
        } : r == "Left" ? function (n, t) {
            n.style.top = t + "px", n.style.left = "0px"
        } : function (n, t) {
            n.style.top = t + "px", n.style.right = "0px"
        };
        var e = i.ether.interval.marker,
            o = i.ether.interval.line,
            s = i.ether.interval.weekend,
            h = (f ? "h" : "v") + r,
            l = e[h + "Styler"],
            a = e[h + "EmphasizedStyler"],
            c = SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.DAY];
        this.createIntervalMarker = function (r, e, h, l, a) {
            var w = Math.round(t.dateToPixelOffset(r)),
                p, k, y;
            if (u && h != SimileAjax.DateTime.WEEK && (p = n.getDocument().createElement("div"), p.className = "timeline-ether-lines", o.opacity < 100 && SimileAjax.Graphics.setOpacity(p, o.opacity), f ? p.style.left = w + "px" : p.style.top = w + "px", a.appendChild(p)), h == SimileAjax.DateTime.WEEK) {
                var nt = i.firstDayOfWeek,
                    d = new Date(r.getTime() + (-1 - nt) * c),
                    tt = new Date(d.getTime() + 2 * c),
                    b = Math.round(t.dateToPixelOffset(d)),
                    it = Math.round(t.dateToPixelOffset(tt)),
                    g = Math.max(1, it - b),
                    v = n.getDocument().createElement("div");
                v.className = "timeline-ether-weekends", s.opacity < 100 && SimileAjax.Graphics.setOpacity(v, s.opacity), f ? (v.style.left = b + "px", v.style.width = g + "px") : (v.style.top = b + "px", v.style.height = g + "px"), a.appendChild(v)
            }
            return k = e.labelInterval(r, h), y = n.getDocument().createElement("div"), y.innerHTML = k.text, y.className = "timeline-date-label", k.emphasized && (y.className += " timeline-date-label-em"), this.positionDiv(y, w), l.appendChild(y), y
        }
    },
    EtherHighlight: function (n, t, i, r) {
        var u = n.isHorizontal();
        this._highlightDiv = null, this._createHighlightDiv = function () {
            if (this._highlightDiv == null) {
                this._highlightDiv = n.getDocument().createElement("div"), this._highlightDiv.setAttribute("name", "ether-highlight"), this._highlightDiv.className = "timeline-ether-highlight";
                var t = i.ether.highlightOpacity;
                t < 100 && SimileAjax.Graphics.setOpacity(this._highlightDiv, t), r.appendChild(this._highlightDiv)
            }
        }, this.position = function (n, i, r, f) {
            r = r || 0, f = f || 1, this._createHighlightDiv();
            var o = Math.round(t.dateToPixelOffset(n)),
                h = Math.round(t.dateToPixelOffset(i)),
                s = Math.max(h - o, 3),
                e = t.getViewWidth() - 4;
            u ? (this._highlightDiv.style.left = o + "px", this._highlightDiv.style.width = s + "px", this._highlightDiv.style.top = Math.round(r * e) + "px", this._highlightDiv.style.height = Math.round(f * e) + "px") : (this._highlightDiv.style.top = o + "px", this._highlightDiv.style.height = s + "px", this._highlightDiv.style.left = Math.round(r * e) + "px", this._highlightDiv.style.width = Math.round(f * e) + "px")
        }
    }
}), Timeline.LinearEther = function (n) {
    this._params = n, this._interval = n.interval, this._pixelsPerInterval = n.pixelsPerInterval
}, Timeline.LinearEther.prototype.initialize = function (n, t) {
    this._band = n, this._timeline = t, this._unit = t.getUnit(), "startsOn" in this._params ? this._start = this._unit.parseFromObject(this._params.startsOn) : "endsOn" in this._params ? (this._start = this._unit.parseFromObject(this._params.endsOn), this.shiftPixels(-this._timeline.getPixelLength())) : "centersOn" in this._params ? (this._start = this._unit.parseFromObject(this._params.centersOn), this.shiftPixels(-this._timeline.getPixelLength() / 2)) : (this._start = this._unit.makeDefaultValue(), this.shiftPixels(-this._timeline.getPixelLength() / 2))
}, Timeline.LinearEther.prototype.setDate = function (n) {
    this._start = this._unit.cloneValue(n)
}, Timeline.LinearEther.prototype.shiftPixels = function (n) {
    var t = this._interval * n / this._pixelsPerInterval;
    this._start = this._unit.change(this._start, t)
}, Timeline.LinearEther.prototype.dateToPixelOffset = function (n) {
    var t = this._unit.compare(n, this._start);
    return this._pixelsPerInterval * t / this._interval
}, Timeline.LinearEther.prototype.pixelOffsetToDate = function (n) {
    var t = n * this._interval / this._pixelsPerInterval;
    return this._unit.change(this._start, t)
}, Timeline.LinearEther.prototype.zoom = function (n) {
    var r = 0,
        t = this._band._zoomIndex,
        i = t;
    return n && t > 0 && (i = t - 1), !n && t < this._band._zoomSteps.length - 1 && (i = t + 1), this._band._zoomIndex = i, this._interval = SimileAjax.DateTime.gregorianUnitLengths[this._band._zoomSteps[i].unit], this._pixelsPerInterval = this._band._zoomSteps[i].pixelsPerInterval, r = this._band._zoomSteps[i].unit - this._band._zoomSteps[t].unit
}, Timeline.HotZoneEther = function (n) {
    this._params = n, this._interval = n.interval, this._pixelsPerInterval = n.pixelsPerInterval, this._theme = n.theme
}, Timeline.HotZoneEther.prototype.initialize = function (n, t) {
    var s, e, u, i;
    for (this._band = n, this._timeline = t, this._unit = t.getUnit(), this._zones = [{
        startTime: Number.NEGATIVE_INFINITY,
        endTime: Number.POSITIVE_INFINITY,
        magnify: 1
    }], s = this._params, e = 0; e < s.zones.length; e++) {
        var o = s.zones[e],
            r = this._unit.parseFromObject(o.start),
            f = this._unit.parseFromObject(o.end);
        for (u = 0; u < this._zones.length && this._unit.compare(f, r) > 0; u++) i = this._zones[u], this._unit.compare(r, i.endTime) < 0 && (this._unit.compare(r, i.startTime) > 0 && (this._zones.splice(u, 0, {
            startTime: i.startTime,
            endTime: r,
            magnify: i.magnify
        }), u++, i.startTime = r), this._unit.compare(f, i.endTime) < 0 ? (this._zones.splice(u, 0, {
            startTime: r,
            endTime: f,
            magnify: o.magnify * i.magnify
        }), u++, i.startTime = f, r = f) : (i.magnify *= o.magnify, r = i.endTime))
    }
    "startsOn" in this._params ? this._start = this._unit.parseFromObject(this._params.startsOn) : "endsOn" in this._params ? (this._start = this._unit.parseFromObject(this._params.endsOn), this.shiftPixels(-this._timeline.getPixelLength())) : "centersOn" in this._params ? (this._start = this._unit.parseFromObject(this._params.centersOn), this.shiftPixels(-this._timeline.getPixelLength() / 2)) : (this._start = this._unit.makeDefaultValue(), this.shiftPixels(-this._timeline.getPixelLength() / 2))
}, Timeline.HotZoneEther.prototype.setDate = function (n) {
    this._start = this._unit.cloneValue(n)
}, Timeline.HotZoneEther.prototype.shiftPixels = function (n) {
    this._start = this.pixelOffsetToDate(n)
}, Timeline.HotZoneEther.prototype.dateToPixelOffset = function (n) {
    return this._dateDiffToPixelOffset(this._start, n)
}, Timeline.HotZoneEther.prototype.pixelOffsetToDate = function (n) {
    return this._pixelOffsetToDate(n, this._start)
}, Timeline.HotZoneEther.prototype.zoom = function (n) {
    var r = 0,
        t = this._band._zoomIndex,
        i = t;
    return n && t > 0 && (i = t - 1), !n && t < this._band._zoomSteps.length - 1 && (i = t + 1), this._band._zoomIndex = i, this._interval = SimileAjax.DateTime.gregorianUnitLengths[this._band._zoomSteps[i].unit], this._pixelsPerInterval = this._band._zoomSteps[i].pixelsPerInterval, r = this._band._zoomSteps[i].unit - this._band._zoomSteps[t].unit
}, Timeline.HotZoneEther.prototype._dateDiffToPixelOffset = function (n, t) {
    var s = this._getScale(),
        r = n,
        e = t,
        o = 0,
        i, u, f;
    if (this._unit.compare(r, e) < 0) {
        for (i = 0; i < this._zones.length;) {
            if (this._unit.compare(r, this._zones[i].endTime) < 0) break;
            i++
        }
        while (this._unit.compare(r, e) < 0) u = this._zones[i], f = this._unit.earlier(e, u.endTime), o += this._unit.compare(f, r) / (s / u.magnify), r = f, i++
    } else {
        for (i = this._zones.length - 1; i >= 0;) {
            if (this._unit.compare(r, this._zones[i].startTime) > 0) break;
            i--
        }
        while (this._unit.compare(r, e) > 0) u = this._zones[i], f = this._unit.later(e, u.startTime), o += this._unit.compare(f, r) / (s / u.magnify), r = f, i--
    }
    return o
}, Timeline.HotZoneEther.prototype._pixelOffsetToDate = function (n, t) {
    var o = this._getScale(),
        i = t,
        r, u, f, e;
    if (n > 0) {
        for (r = 0; r < this._zones.length;) {
            if (this._unit.compare(i, this._zones[r].endTime) < 0) break;
            r++
        }
        while (n > 0) u = this._zones[r], f = o / u.magnify, u.endTime == Number.POSITIVE_INFINITY ? (i = this._unit.change(i, n * f), n = 0) : (e = this._unit.compare(u.endTime, i) / f, e > n ? (i = this._unit.change(i, n * f), n = 0) : (i = u.endTime, n -= e)), r++
    } else {
        for (r = this._zones.length - 1; r >= 0;) {
            if (this._unit.compare(i, this._zones[r].startTime) > 0) break;
            r--
        }
        for (n = -n; n > 0;) u = this._zones[r], f = o / u.magnify, u.startTime == Number.NEGATIVE_INFINITY ? (i = this._unit.change(i, -n * f), n = 0) : (e = this._unit.compare(i, u.startTime) / f, e > n ? (i = this._unit.change(i, -n * f), n = 0) : (i = u.startTime, n -= e)), r--
    }
    return i
}, Timeline.HotZoneEther.prototype._getScale = function () {
    return this._interval / this._pixelsPerInterval
}, Timeline.EventUtils = {
    getNewEventID: function () {
        return this._lastEventID == null && (this._lastEventID = 0), this._lastEventID += 1, "e" + this._lastEventID
    },
    decodeEventElID: function (n) {
        var t = n.split("-");
        if (t[1] != "tl") return alert("Internal Timeline problem 101, please consult support"), {
            band: null,
            evt: null
        };
        var r = Timeline.getTimelineFromID(t[2]),
            i = r.getBand(t[3]),
            u = i.getEventSource.getEvent(t[4]);
        return {
            band: i,
            evt: u
        }
    },
    encodeEventElID: function (n, t, i, r) {
        return i + "-tl-" + n.timelineID + "-" + t.getIndex() + "-" + r.getID()
    }
}, Timeline.Event = function (n) {
    function t(t) {
        return n[t] != null && n[t] != "" ? n[t] : null
    }
    var r = n.id ? n.id.trim() : "",
        i;
    this._id = r.length > 0 ? r : Timeline.EventUtils.getNewEventID(), this._instant = n.instant || n.end == null, this._start = n.start, this._end = n.end != null ? n.end : n.start, this._latestStart = n.latestStart != null ? n.latestStart : n.instant ? this._end : this._start, this._earliestEnd = n.earliestEnd != null ? n.earliestEnd : this._end, i = [], this._start > this._latestStart && (this._latestStart = this._start, i.push("start is > latestStart")), this._start > this._earliestEnd && (this._earliestEnd = this._latestStart, i.push("start is > earliestEnd")), this._start > this._end && (this._end = this._earliestEnd, i.push("start is > end")), this._latestStart > this._earliestEnd && (this._earliestEnd = this._latestStart, i.push("latestStart is > earliestEnd")), this._latestStart > this._end && (this._end = this._earliestEnd, i.push("latestStart is > end")), this._earliestEnd > this._end && (this._end = this._earliestEnd, i.push("earliestEnd is > end")), this._eventID = t("eventID"), this._text = n.text == null ? "" : n.text, i.length > 0 && (this._text += " PROBLEM: " + i.join(", ")), this._bubbleTitle = n.bubbleTitle, this._description = n.description, this._image = t("image"), this._link = t("link"), this._title = t("hoverText"), this._title = t("caption"), this._icon = t("icon"), this._color = t("color"), this._textColor = t("textColor"), this._classname = t("classname"), this._tapeImage = t("tapeImage"), this._tapeRepeat = t("tapeRepeat"), this._trackNum = t("trackNum"), this._trackNum != null && (this._trackNum = parseInt(this._trackNum))
}, $.extend(Timeline.Event.prototype, {
    getID: function () {
        return this._id
    },
    isInstant: function () {
        return this._instant
    },
    isImprecise: function () {
        return this._start != this._latestStart || this._end != this._earliestEnd
    },
    getStart: function () {
        return this._start
    },
    getEnd: function () {
        return this._end
    },
    getLatestStart: function () {
        return this._latestStart
    },
    getEarliestEnd: function () {
        return this._earliestEnd
    },
    getEventID: function () {
        return this._eventID
    },
    getText: function () {
        return this._text
    },
    getBubbleTitle: function () {
        return this._bubbleTitle
    },
    getDescription: function () {
        return this._description
    },
    getImage: function () {
        return this._image
    },
    getLink: function () {
        return this._link
    },
    getIcon: function () {
        return this._icon
    },
    getColor: function () {
        return this._color
    },
    getTextColor: function () {
        return this._textColor
    },
    getClassName: function () {
        return this._classname
    },
    getTapeImage: function () {
        return this._tapeImage
    },
    getTapeRepeat: function () {
        return this._tapeRepeat
    },
    getTrackNum: function () {
        return this._trackNum
    },
    getProperty: function () {
        return null
    },
    fillInfoBubble: function (n, t) {
        var e = n.ownerDocument,
            f = this.getBubbleTitle() ? this.getBubbleTitle() : this.getText(),
            r = this.getLink(),
            u = this.getImage(),
            o = this.getDescription();
        u != null && t.event.bubble.imageStyler($("<img src='" + u + "'/>").appendTo(n).get(0)), t.event.bubble.titleStyler($("<div>" + (r ? "<a href='" + r + "'>" : "") + f + (r ? "<\/a>" : "") + "<\/div>").appendTo(n).get(0)), t.event.bubble.bodyStyler($("<div>" + this.getDescription() + "<\/div>").appendTo(n).get(0))
    }
}), Timeline.OriginalEventPainter = function (n) {
    this._params = n, this._onSelectListeners = [], this._eventPaintListeners = [], this._filterMatcher = null, this._highlightMatcher = null, this._frc = null, this._eventIdToElmt = {}
}, $.extend(Timeline.OriginalEventPainter.prototype, {
    initialize: function (n, t) {
        this._band = n, this._timeline = t, this._backLayer = null, this._eventLayer = null, this._lineLayer = null, this._highlightLayer = null, this._eventIdToElmt = null
    },
    getType: function () {
        return "original"
    },
    supportsOrthogonalScrolling: function () {
        return !0
    },
    addOnSelectListener: function (n) {
        this._onSelectListeners.push(n)
    },
    removeOnSelectListener: function (n) {
        for (var t = 0; t < this._onSelectListeners.length; t++)
            if (this._onSelectListeners[t] == n) {
                this._onSelectListeners.splice(t, 1);
                break
            }
    },
    addEventPaintListener: function (n) {
        this._eventPaintListeners.push(n)
    },
    removeEventPaintListener: function (n) {
        for (var t = 0; t < this._eventPaintListeners.length; t++)
            if (this._eventPaintListeners[t] == n) {
                this._eventPaintListeners.splice(t, 1);
                break
            }
    },
    getFilterMatcher: function () {
        return this._filterMatcher
    },
    setFilterMatcher: function (n) {
        this._filterMatcher = n
    },
    getHighlightMatcher: function () {
        return this._highlightMatcher
    },
    setHighlightMatcher: function (n) {
        this._highlightMatcher = n
    },
    paint: function () {
        var i = this._band.getEventSource(),
            n;
        if (i != null) {
            this._eventIdToElmt = {}, this._fireEventPaintListeners("paintStarting", null, null), this._prepareForPainting();
            for (var t = this._computeMetrics(), u = this._band.getMinDate(), f = this._band.getMaxDate(), e = this._filterMatcher != null ? this._filterMatcher : function () {
                    return !0
                }, o = this._highlightMatcher != null ? this._highlightMatcher : function () {
                    return -1
                }, r = i.getEventReverseIterator(u, f); r.hasNext();) n = r.next(), e(n) && this.paintEvent(n, t, this._params.theme, o(n));
            this._highlightLayer.style.display = "block", this._lineLayer.style.display = "block", this._eventLayer.style.display = "block", this._band.updateEventTrackInfo(this._tracks.length, t.trackIncrement), this._fireEventPaintListeners("paintEnded", null, null), this._setOrthogonalOffset(t)
        }
    },
    softPaint: function () {
        this._setOrthogonalOffset(this._computeMetrics())
    },
    getOrthogonalExtent: function () {
        var n = this._computeMetrics();
        return 2 * n.trackOffset + this._tracks.length * n.trackIncrement
    },
    _setOrthogonalOffset: function () {
        var t = this._band.getViewOrthogonalOffset();
        this._highlightLayer.style.top = this._lineLayer.style.top = this._eventLayer.style.top = t + "px"
    },
    _computeMetrics: function () {
        this._frc == null && this._prepareForPainting();
        var n = this._params.theme.event,
            t = Math.max(n.track.height, n.tape.height + this._frc.getLineHeight());
        return {
            trackOffset: n.track.offset,
            trackHeight: t,
            trackGap: n.track.gap,
            trackIncrement: t + n.track.gap,
            icon: n.instant.icon,
            iconWidth: n.instant.iconWidth,
            iconHeight: n.instant.iconHeight,
            labelWidth: n.label.width,
            maxLabelChar: n.label.maxLabelChar,
            impreciseIconMargin: n.instant.impreciseIconMargin
        }
    },
    _prepareForPainting: function () {
        var n = this._band,
            t;
        this._backLayer == null && (this._backLayer = this._band.createLayerDiv(0, "timeline-band-events").css("visibility", "hidden").show().get(0), t = document.createElement("span"), t.className = "timeline-event-label", this._backLayer.appendChild(t), this._frc = SimileAjax.Graphics.getFontRenderingContext(t)), this._frc.update(), this._tracks = [], this._highlightLayer != null && n.removeLayerDiv(this._highlightLayer), this._highlightLayer = n.createLayerDiv(105, "timeline-band-highlights").get(0), this._highlightLayer.style.display = "none", this._lineLayer != null && n.removeLayerDiv(this._lineLayer), this._lineLayer = n.createLayerDiv(110, "timeline-band-lines").get(0), this._lineLayer.style.display = "none", this._eventLayer != null && n.removeLayerDiv(this._eventLayer), this._eventLayer = n.createLayerDiv(115, "timeline-band-events").get(0), this._eventLayer.style.display = "none"
    },
    paintEvent: function (n, t, i, r) {
        n.isInstant() ? this.paintInstantEvent(n, t, i, r) : this.paintDurationEvent(n, t, i, r)
    },
    paintInstantEvent: function (n, t, i, r) {
        n.isImprecise() ? this.paintImpreciseInstantEvent(n, t, i, r) : this.paintPreciseInstantEvent(n, t, i, r)
    },
    paintDurationEvent: function (n, t, i, r) {
        n.isImprecise() ? this.paintImpreciseDurationEvent(n, t, i, r) : this.paintPreciseDurationEvent(n, t, i, r)
    },
    paintPreciseInstantEvent: function (n, t, i, r) {
        var tt = this._timeline.getDocument(),
            s = n.getText(),
            w = n.getStart(),
            h = Math.round(this._band.dateToPixelOffset(w)),
            b = Math.round(h + t.iconWidth / 2),
            c = Math.round(h - t.iconWidth / 2),
            l = this._getLabelDivClassName(n),
            f = this._frc.computeSize(s, l),
            a = b + i.event.label.offsetFromLine,
            k = a + f.width,
            d = k,
            e = this._findFreeTrack(n, d),
            g = Math.round(t.trackOffset + e * t.trackIncrement + t.trackHeight / 2 - f.height / 2),
            u = this._paintEventIcon(n, e, c, t, i, 0),
            v = this._paintEventLabel(n, s, a, g, f.width, f.height, i, l, r),
            y = [u.elmt, v.elmt],
            nt = this,
            p = function (t, i) {
                return nt._onClickInstantEvent(u.elmt, i, n)
            }, o;
        SimileAjax.DOM.registerEvent(u.elmt, "mousedown", p), SimileAjax.DOM.registerEvent(v.elmt, "mousedown", p), o = this._createHighlightDiv(r, u, i, n), o != null && y.push(o), this._fireEventPaintListeners("paintedEvent", n, y), this._eventIdToElmt[n.getID()] = u.elmt, this._tracks[e] = c
    },
    paintImpreciseInstantEvent: function (n, t, i, r) {
        var et = this._timeline.getDocument(),
            l = n.getText(),
            g = n.getStart(),
            nt = n.getEnd(),
            o = Math.round(this._band.dateToPixelOffset(g)),
            a = Math.round(this._band.dateToPixelOffset(nt)),
            tt = Math.round(o + t.iconWidth / 2),
            v = Math.round(o - t.iconWidth / 2),
            y = this._getLabelDivClassName(n),
            s = this._frc.computeSize(l, y),
            p = tt + i.event.label.offsetFromLine,
            it = p + s.width,
            rt = Math.max(it, a),
            f = this._findFreeTrack(n, rt),
            w = i.event.tape.height,
            ut = Math.round(t.trackOffset + f * t.trackIncrement + w),
            u = this._paintEventIcon(n, f, v, t, i, w),
            b = this._paintEventLabel(n, l, p, ut, s.width, s.height, i, y, r),
            e = n.getColor(),
            c;
        e = e != null ? e : i.event.instant.impreciseColor;
        var k = this._paintEventTape(n, f, o, a, e, i.event.instant.impreciseOpacity, t, i, 0),
            d = [u.elmt, b.elmt, k.elmt],
            ft = this,
            h = function (t, i) {
                return ft._onClickInstantEvent(u.elmt, i, n)
            };
        SimileAjax.DOM.registerEvent(u.elmt, "mousedown", h), SimileAjax.DOM.registerEvent(k.elmt, "mousedown", h), SimileAjax.DOM.registerEvent(b.elmt, "mousedown", h), c = this._createHighlightDiv(r, u, i, n), c != null && d.push(c), this._fireEventPaintListeners("paintedEvent", n, d), this._eventIdToElmt[n.getID()] = u.elmt, this._tracks[f] = v
    },
    paintPreciseDurationEvent: function (n, t, i, r) {
        var it = this._timeline.getDocument(),
            c = n.getText(),
            b = n.getStart(),
            k = n.getEnd(),
            e = Math.round(this._band.dateToPixelOffset(b)),
            l = Math.round(this._band.dateToPixelOffset(k)),
            a = this._getLabelDivClassName(n),
            o = this._frc.computeSize(c, a),
            v = e,
            d = v + o.width,
            g = Math.max(d, l),
            s = this._findFreeTrack(n, g),
            nt = Math.round(t.trackOffset + s * t.trackIncrement + i.event.tape.height),
            f = n.getColor(),
            h;
        f = f != null ? f : i.event.duration.color;
        var u = this._paintEventTape(n, s, e, l, f, 100, t, i, 0),
            y = this._paintEventLabel(n, c, v, nt, o.width, o.height, i, a, r),
            p = [u.elmt, y.elmt],
            tt = this,
            w = function (t, i) {
                return tt._onClickDurationEvent(u.elmt, i, n)
            };
        SimileAjax.DOM.registerEvent(u.elmt, "mousedown", w), SimileAjax.DOM.registerEvent(y.elmt, "mousedown", w), h = this._createHighlightDiv(r, u, i, n), h != null && p.push(h), this._fireEventPaintListeners("paintedEvent", n, p), this._eventIdToElmt[n.getID()] = u.elmt, this._tracks[s] = e
    },
    paintImpreciseDurationEvent: function (n, t, i, r) {
        var ot = this._timeline.getDocument(),
            h = n.getText(),
            k = n.getStart(),
            d = n.getLatestStart(),
            g = n.getEnd(),
            nt = n.getEarliestEnd(),
            c = Math.round(this._band.dateToPixelOffset(k)),
            l = Math.round(this._band.dateToPixelOffset(d)),
            a = Math.round(this._band.dateToPixelOffset(g)),
            tt = Math.round(this._band.dateToPixelOffset(nt)),
            v = this._getLabelDivClassName(n),
            o = this._frc.computeSize(h, v),
            y = l,
            it = y + o.width,
            rt = Math.max(it, a),
            f = this._findFreeTrack(n, rt),
            ut = Math.round(t.trackOffset + f * t.trackIncrement + i.event.tape.height),
            e = n.getColor(),
            s;
        e = e != null ? e : i.event.duration.color;
        var ft = this._paintEventTape(n, f, c, a, i.event.duration.impreciseColor, i.event.duration.impreciseOpacity, t, i, 0),
            u = this._paintEventTape(n, f, l, tt, e, 100, t, i, 1),
            p = this._paintEventLabel(n, h, y, ut, o.width, o.height, i, v, r),
            w = [ft.elmt, u.elmt, p.elmt],
            et = this,
            b = function (t, i) {
                return et._onClickDurationEvent(u.elmt, i, n)
            };
        SimileAjax.DOM.registerEvent(u.elmt, "mousedown", b), SimileAjax.DOM.registerEvent(p.elmt, "mousedown", b), s = this._createHighlightDiv(r, u, i, n), s != null && w.push(s), this._fireEventPaintListeners("paintedEvent", n, w), this._eventIdToElmt[n.getID()] = u.elmt, this._tracks[f] = c
    },
    _encodeEventElID: function (n, t) {
        return Timeline.EventUtils.encodeEventElID(this._timeline, this._band, n, t)
    },
    _findFreeTrack: function (n, t) {
        var r = n.getTrackNum(),
            i, u;
        if (r != null) return r;
        for (i = 0; i < this._tracks.length; i++)
            if (u = this._tracks[i], u > t) break;
        return i
    },
    _paintEventIcon: function (n, t, i, r, u, f) {
        var o = n.getIcon(),
            s, h, c, e;
        return o = o != null ? o : r.icon, f > 0 ? s = r.trackOffset + t * r.trackIncrement + f + r.impreciseIconMargin : (h = r.trackOffset + t * r.trackIncrement + r.trackHeight / 2, s = Math.round(h - r.iconHeight / 2)), c = SimileAjax.Graphics.createTranslucentImage(o), e = this._timeline.getDocument().createElement("div"), e.className = this._getElClassName("timeline-event-icon", n, "icon"), e.id = this._encodeEventElID("icon", n), e.style.left = i + "px", e.style.top = s + "px", e.appendChild(c), n._title != null && (e.title = n._title), this._eventLayer.appendChild(e), {
            left: i,
            top: s,
            width: r.iconWidth,
            height: r.iconHeight,
            elmt: e
        }
    },
    _paintEventLabel: function (n, t, i, r, u, f, e, o, s) {
        var l = this._timeline.getDocument(),
            h = l.createElement("div"),
            c;
        return h.className = o, h.id = this._encodeEventElID("label", n), h.style.left = i + "px", h.style.width = u + "px", h.style.top = r + "px", h.innerHTML = t, n._title != null && (h.title = n._title), c = n.getTextColor(), c == null && (c = n.getColor()), c != null && (h.style.color = c), e.event.highlightLabelBackground && s >= 0 && (h.style.background = this._getHighlightColor(s, e)), this._eventLayer.appendChild(h), {
            left: i,
            top: r,
            width: u,
            height: f,
            elmt: h
        }
    },
    _paintEventTape: function (n, t, i, r, u, f, e, o, s) {
        var a = r - i,
            v = o.event.tape.height,
            y = e.trackOffset + t * e.trackIncrement,
            h = this._timeline.getDocument().createElement("div"),
            l, c;
        return h.className = this._getElClassName("timeline-event-tape", n, "tape"), h.id = this._encodeEventElID("tape" + s, n), h.style.left = i + "px", h.style.width = a + "px", h.style.height = v + "px", h.style.top = y + "px", n._title != null && (h.title = n._title), u != null && (h.style.backgroundColor = u), l = n.getTapeImage(), c = n.getTapeRepeat(), c = c != null ? c : "repeat", l != null && (h.style.backgroundImage = "url(" + l + ")", h.style.backgroundRepeat = c), SimileAjax.Graphics.setOpacity(h, f), this._eventLayer.appendChild(h), {
            left: i,
            top: y,
            width: a,
            height: v,
            elmt: h
        }
    },
    _getLabelDivClassName: function (n) {
        return this._getElClassName("timeline-event-label", n, "label")
    },
    _getElClassName: function (n, t, i) {
        var u = t.getClassName(),
            r = [];
        return u && (i && r.push(i + "-" + u + " "), r.push(u + " ")), r.push(n), r.join("")
    },
    _getHighlightColor: function (n, t) {
        var i = t.event.highlightColors;
        return i[Math.min(n, i.length - 1)]
    },
    _createHighlightDiv: function (n, t, i, r) {
        var u = null,
            f, e;
        return n >= 0 && (f = this._timeline.getDocument(), e = this._getHighlightColor(n, i), u = f.createElement("div"), u.className = this._getElClassName("timeline-event-highlight", r, "highlight"), u.id = this._encodeEventElID("highlight0", r), u.style.position = "absolute", u.style.overflow = "hidden", u.style.left = t.left - 2 + "px", u.style.width = t.width + 4 + "px", u.style.top = t.top - 2 + "px", u.style.height = t.height + 4 + "px", u.style.background = e, this._highlightLayer.appendChild(u)), u
    },
    _onClickInstantEvent: function (n, t, i) {
        var r = SimileAjax.DOM.getPageCoordinates(n);
        return this._showBubble(r.left + Math.ceil(n.offsetWidth / 2), r.top + Math.ceil(n.offsetHeight / 2), i), this._fireOnSelect(i.getID()), t.cancelBubble = !0, SimileAjax.DOM.cancelEvent(t), !1
    },
    _onClickDurationEvent: function (n, t, i) {
        var u, f;
        if ("pageX" in t) u = t.pageX, f = t.pageY;
        else var r = SimileAjax.DOM.getPageCoordinates(n),
        u = t.offsetX + r.left, f = t.offsetY + r.top;
        return this._showBubble(u, f, i), this._fireOnSelect(i.getID()), t.cancelBubble = !0, SimileAjax.DOM.cancelEvent(t), !1
    },
    showBubble: function (n) {
        var t = this._eventIdToElmt[n.getID()],
            i;
        t && (i = SimileAjax.DOM.getPageCoordinates(t), this._showBubble(i.left + t.offsetWidth / 2, i.top + t.offsetHeight / 2, n))
    },
    _showBubble: function (n, t, i) {
        var r = document.createElement("div"),
            u = this._params.theme.event.bubble;
        i.fillInfoBubble(r, this._params.theme, this._band.getLabeller()), SimileAjax.WindowManager.cancelPopups(), SimileAjax.Graphics.createBubbleForContentAndPoint(r, n, t, u.width, null, u.maxHeight)
    },
    _fireOnSelect: function (n) {
        for (var t = 0; t < this._onSelectListeners.length; t++) this._onSelectListeners[t](n)
    },
    _fireEventPaintListeners: function (n, t, i) {
        for (var r = 0; r < this._eventPaintListeners.length; r++) this._eventPaintListeners[r](this._band, n, t, i)
    }
}), Timeline.OverviewEventPainter = function (n) {
    this._params = n, this._onSelectListeners = [], this._filterMatcher = null, this._highlightMatcher = null
}, $.extend(Timeline.OverviewEventPainter.prototype, {
    initialize: function (n, t) {
        this._band = n, this._timeline = t, this._eventLayer = null, this._highlightLayer = null
    },
    getType: function () {
        return "overview"
    },
    addOnSelectListener: function (n) {
        this._onSelectListeners.push(n)
    },
    removeOnSelectListener: function (n) {
        for (var t = 0; t < this._onSelectListeners.length; t++)
            if (this._onSelectListeners[t] == n) {
                this._onSelectListeners.splice(t, 1);
                break
            }
    },
    getFilterMatcher: function () {
        return this._filterMatcher
    },
    setFilterMatcher: function (n) {
        this._filterMatcher = n
    },
    getHighlightMatcher: function () {
        return this._highlightMatcher
    },
    setHighlightMatcher: function (n) {
        this._highlightMatcher = n
    },
    paint: function () {
        var i = this._band.getEventSource(),
            t;
        if (i != null) {
            this._prepareForPainting();
            for (var n = this._params.theme.event, r = {
                    trackOffset: n.overviewTrack.offset,
                    trackHeight: n.overviewTrack.height,
                    trackGap: n.overviewTrack.gap,
                    trackIncrement: n.overviewTrack.height + n.overviewTrack.gap
                }, f = this._band.getMinDate(), e = this._band.getMaxDate(), o = this._filterMatcher != null ? this._filterMatcher : function () {
                    return !0
                }, s = this._highlightMatcher != null ? this._highlightMatcher : function () {
                    return -1
                }, u = i.getEventReverseIterator(f, e); u.hasNext();) t = u.next(), o(t) && this.paintEvent(t, r, this._params.theme, s(t));
            this._highlightLayer.style.display = "block", this._eventLayer.style.display = "block", this._band.updateEventTrackInfo(this._tracks.length, r.trackIncrement)
        }
    },
    softPaint: function () {},
    _prepareForPainting: function () {
        var n = this._band;
        this._tracks = [], this._highlightLayer != null && n.removeLayerDiv(this._highlightLayer), this._highlightLayer = n.createLayerDiv(105, "timeline-band-highlights").get(0), this._eventLayer != null && n.removeLayerDiv(this._eventLayer), this._eventLayer = n.createLayerDiv(110, "timeline-band-events").get(0)
    },
    paintEvent: function (n, t, i, r) {
        n.isInstant() ? this.paintInstantEvent(n, t, i, r) : this.paintDurationEvent(n, t, i, r)
    },
    paintInstantEvent: function (n, t, i, r) {
        var e = n.getStart(),
            o = Math.round(this._band.dateToPixelOffset(e)),
            u = n.getColor(),
            s = n.getClassName(),
            f;
        u = s ? null : u != null ? u : i.event.duration.color, f = this._paintEventTick(n, o, u, 100, t, i), this._createHighlightDiv(r, f, i)
    },
    paintDurationEvent: function (n, t, i, r) {
        for (var h = n.getLatestStart(), c = n.getEarliestEnd(), l = Math.round(this._band.dateToPixelOffset(h)), e = Math.round(this._band.dateToPixelOffset(c)), f = 0, u, o, s; f < this._tracks.length; f++)
            if (e < this._tracks[f]) break;
        this._tracks[f] = e, u = n.getColor(), o = n.getClassName(), u = o ? null : u != null ? u : i.event.duration.color, s = this._paintEventTape(n, f, l, e, u, 100, t, i, o), this._createHighlightDiv(r, s, i)
    },
    _paintEventTape: function (n, t, i, r, u, f, e, o, s) {
        var c = e.trackOffset + t * e.trackIncrement,
            l = r - i,
            a = e.trackHeight,
            h = $("div class='timeline-small-event-tape" + (s ? " small-" + s : "") + "'/>").css({
                left: i + "px",
                width: l + "px",
                top: c + "px",
                height: a + "px"
            }).appendTo(this._eventLayer);
        return u && h.css("backgroundColor", u), f < 100 && SimileAjax.Graphics.setOpacity(h.get(0), f), {
            left: i,
            top: c,
            width: l,
            height: a,
            elmt: h.get(0)
        }
    },
    _paintEventTick: function (n, t, i, r, u, f) {
        var s = f.event.overviewTrack.tickHeight,
            h = u.trackOffset - s,
            c = 1,
            e = this._timeline.getDocument().createElement("div"),
            o;
        return e.className = "timeline-small-event-icon", e.style.left = t + "px", e.style.top = h + "px", o = n.getClassName(), o && (e.className += " small-" + o), r < 100 && SimileAjax.Graphics.setOpacity(e, r), this._eventLayer.appendChild(e), {
            left: t,
            top: h,
            width: c,
            height: s,
            elmt: e
        }
    },
    _createHighlightDiv: function (n, t, i) {
        if (n >= 0) {
            var f = this._timeline.getDocument(),
                u = i.event,
                e = u.highlightColors[Math.min(n, u.highlightColors.length - 1)],
                r = f.createElement("div");
            r.style.position = "absolute", r.style.overflow = "hidden", r.style.left = t.left - 1 + "px", r.style.width = t.width + 2 + "px", r.style.top = t.top - 1 + "px", r.style.height = t.height + 2 + "px", r.style.background = e, this._highlightLayer.appendChild(r)
        }
    },
    showBubble: function () {}
}), Timeline.DefaultEventSource = function (n) {
    this._events = n instanceof Object ? n : new SimileAjax.EventIndex, this._listeners = []
}, $.extend(Timeline.DefaultEventSource.prototype, {
    addListener: function (n) {
        this._listeners.push(n)
    },
    removeListener: function (n) {
        for (var t = 0; t < this._listeners.length; t++)
            if (this._listeners[t] == n) {
                this._listeners.splice(t, 1);
                break
            }
    },
    loadXML: function (n, t) {
        for (var e = this._getBaseURL(t), h = n.documentElement.getAttribute("date-time-format"), r = this._events.getUnit().getParser(h), i = n.documentElement.firstChild, o = !1, f, s, u; i != null;) i.nodeType == 1 && (f = "", i.firstChild != null && i.firstChild.nodeType == 3 && (f = i.firstChild.nodeValue), s = i.getAttribute("isDuration") === null && i.getAttribute("durationEvent") === null || i.getAttribute("isDuration") == "false" || i.getAttribute("durationEvent") == "false", u = new Timeline.Event({
            id: i.getAttribute("id"),
            start: r(i.getAttribute("start")),
            end: r(i.getAttribute("end")),
            latestStart: r(i.getAttribute("latestStart")),
            earliestEnd: r(i.getAttribute("earliestEnd")),
            instant: s,
            text: i.getAttribute("title"),
            bubbleTitle: i.getAttribute("bubbleTitle"),
            description: f,
            image: this._resolveRelativeURL(i.getAttribute("image"), e),
            link: this._resolveRelativeURL(i.getAttribute("link"), e),
            icon: this._resolveRelativeURL(i.getAttribute("icon"), Timeline.urlPrefix + "images/"),
            color: i.getAttribute("color"),
            textColor: i.getAttribute("textColor"),
            hoverText: i.getAttribute("hoverText"),
            classname: i.getAttribute("classname"),
            tapeImage: i.getAttribute("tapeImage"),
            tapeRepeat: i.getAttribute("tapeRepeat"),
            caption: i.getAttribute("caption"),
            eventID: i.getAttribute("eventID"),
            trackNum: i.getAttribute("trackNum")
        }), u._node = i, u.getProperty = function (n) {
            return this._node.getAttribute(n)
        }, this._events.add(u), o = !0), i = i.nextSibling;
        o && this._fire("onAddMany", [])
    },
    loadJSON: function (n, t) {
        var e = this._getBaseURL(t),
            o = !1,
            s, r, u;
        if (n && n.events)
            for (s = ("dateTimeFormat" in n) ? n.dateTimeFormat : null, r = this._events.getUnit().getParser(s), u = 0; u < n.events.length; u++) {
                var i = n.events[u],
                    h = i.isDuration || "durationEvent" in i && !i.durationEvent || "de" in i && !i.de,
                    f = new Timeline.Event({
                        id: "id" in i ? i.id : undefined,
                        start: r(i.start || i.s),
                        end: r(i.end || i.e),
                        latestStart: r(i.latestStart || i.ls),
                        earliestEnd: r(i.earliestEnd || i.ee),
                        instant: h,
                        text: i.title || i.t,
                        bubbleTitle: i.bubbleTitle || i.bt,
                        description: i.description || i.d,
                        image: this._resolveRelativeURL(i.image, e),
                        link: this._resolveRelativeURL(i.link, e),
                        icon: this._resolveRelativeURL(i.icon, Timeline.urlPrefix + "images/"),
                        color: i.color,
                        textColor: i.textColor,
                        hoverText: i.hoverText,
                        classname: i.classname || i.c,
                        tapeImage: i.tapeImage,
                        tapeRepeat: i.tapeRepeat,
                        caption: i.caption,
                        eventID: i.eventID || i.eid,
                        trackNum: i.trackNum
                    });
                f._obj = i, f.getProperty = function (n) {
                    return this._obj[n]
                }, this._events.add(f), o = !0
            }
        o && this._fire("onAddMany", [])
    },
    add: function (n) {
        this._events.add(n), this._fire("onAddOne", [n])
    },
    addMany: function (n) {
        for (var t = 0; t < n.length; t++) this._events.add(n[t]);
        this._fire("onAddMany", [])
    },
    clear: function () {
        this._events.removeAll(), this._fire("onClear", [])
    },
    getEvent: function (n) {
        return this._events.getEvent(n)
    },
    getEventIterator: function (n, t) {
        return this._events.getIterator(n, t)
    },
    getEventReverseIterator: function (n, t) {
        return this._events.getReverseIterator(n, t)
    },
    getAllEventIterator: function () {
        return this._events.getAllIterator()
    },
    getCount: function () {
        return this._events.getCount()
    },
    getEarliestDate: function () {
        return this._events.getEarliestDate()
    },
    getLatestDate: function () {
        return this._events.getLatestDate()
    },
    _fire: function (n, t) {
        for (var r, i = 0; i < this._listeners.length; i++)
            if (r = this._listeners[i], n in r) try {
                r[n].apply(r, t)
            } catch (u) {}
    },
    _getBaseURL: function (n) {
        var t, i;
        return n.indexOf("://") < 0 && (t = this._getBaseURL(document.location.href), n = n.substr(0, 1) == "/" ? t.substr(0, t.indexOf("/", t.indexOf("://") + 3)) + n : t + n), i = n.lastIndexOf("/"), i < 0 ? "" : n.substr(0, i + 1)
    },
    _resolveRelativeURL: function (n, t) {
        return n == null || n == "" ? n : n.indexOf("://") > 0 ? n : n.substr(0, 1) == "/" ? t.substr(0, t.indexOf("/", t.indexOf("://") + 3)) + n : t + n
    }
}), Timeline.ClassicTheme = {}, Timeline.ClassicTheme.implementations = [], Timeline.ClassicTheme.create = function (n) {
    n == null && (n = Timeline.getDefaultLocale());
    var t = Timeline.ClassicTheme.implementations[n];
    return t == null && (t = Timeline.ClassicTheme._Impl), new t
}, Timeline.ClassicTheme._Impl = function () {
    this.firstDayOfWeek = 0, this.autoWidth = !1, this.autoWidthAnimationTime = 500, this.timeline_start = null, this.timeline_stop = null, this.ether = {
        backgroundColors: [],
        highlightOpacity: 50,
        interval: {
            line: {
                show: !0,
                opacity: 25
            },
            weekend: {
                opacity: 30
            },
            marker: {
                hAlign: "Bottom",
                vAlign: "Right"
            }
        }
    }, this.event = {
        track: {
            height: 10,
            gap: 2,
            offset: 2,
            autoWidthMargin: 1.5
        },
        overviewTrack: {
            offset: 20,
            tickHeight: 6,
            height: 2,
            gap: 1,
            autoWidthMargin: 5
        },
        tape: {
            height: 4
        },
        instant: {
            icon: Timeline.urlPrefix + "images/dull-blue-circle.png",
            iconWidth: 10,
            iconHeight: 10,
            impreciseOpacity: 20,
            impreciseIconMargin: 3
        },
        duration: {
            impreciseOpacity: 20
        },
        label: {
            backgroundOpacity: 50,
            offsetFromLine: 3
        },
        highlightColors: ["#FFFF00", "#FFC000", "#FF0000", "#0000FF"],
        highlightLabelBackground: !1,
        bubble: {
            width: 250,
            maxHeight: 0,
            titleStyler: function (n) {
                n.className = "timeline-event-bubble-title"
            },
            bodyStyler: function (n) {
                n.className = "timeline-event-bubble-body"
            },
            imageStyler: function (n) {
                n.className = "timeline-event-bubble-image"
            }
        }
    }, this.mouseWheel = "scroll"
}, Timeline.ajax_lib_version = SimileAjax.version, Timeline.display_version = Timeline.version + " (with Ajax lib " + Timeline.ajax_lib_version + ")", Timeline.HORIZONTAL = 0, Timeline.VERTICAL = 1, Timeline._defaultTheme = null, Timeline.getDefaultLocale = function () {
    return Timeline.clientLocale
}, Timeline.create = function (n, t, i, r) {
    var u, f;
    return Timeline.timelines == null && (Timeline.timelines = []), u = Timeline.timelines.length, Timeline.timelines[u] = null, f = new Timeline._Impl(n, t, i, r, u), Timeline.timelines[u] = f, f
}, Timeline.createBandInfo = function (n) {
    var i = "theme" in n ? n.theme : Timeline.getDefaultTheme(),
        e = "decorators" in n ? n.decorators : [],
        o = "eventSource" in n ? n.eventSource : null,
        s = new Timeline.LinearEther({
            centersOn: "date" in n ? n.date : new Date,
            interval: SimileAjax.DateTime.gregorianUnitLengths[n.intervalUnit],
            pixelsPerInterval: n.intervalPixels,
            theme: i
        }),
        h = new Timeline.GregorianEtherPainter({
            unit: n.intervalUnit,
            multiple: "multiple" in n ? n.multiple : 1,
            theme: i,
            align: "align" in n ? n.align : undefined
        }),
        t = {
            showText: "showEventText" in n ? n.showEventText : !0,
            theme: i
        }, u, f, r;
    if ("eventPainterParams" in n)
        for (u in n.eventPainterParams) t[u] = n.eventPainterParams[u];
    if ("trackHeight" in n && (t.trackHeight = n.trackHeight), "trackGap" in n && (t.trackGap = n.trackGap), f = "overview" in n && n.overview ? "overview" : "layout" in n ? n.layout : "original", "eventPainter" in n) r = new n.eventPainter(t);
    else switch (f) {
    case "overview":
        r = new Timeline.OverviewEventPainter(t);
        break;
    default:
        r = new Timeline.OriginalEventPainter(t)
    }
    return {
        width: n.width,
        eventSource: o,
        timeZone: "timeZone" in n ? n.timeZone : 0,
        ether: s,
        etherPainter: h,
        eventPainter: r,
        theme: i,
        decorators: e,
        zoomIndex: "zoomIndex" in n ? n.zoomIndex : 0,
        zoomSteps: "zoomSteps" in n ? n.zoomSteps : null
    }
}, Timeline.createHotZoneBandInfo = function (n) {
    var r = "theme" in n ? n.theme : Timeline.getDefaultTheme(),
        e = "eventSource" in n ? n.eventSource : null,
        o = new Timeline.HotZoneEther({
            centersOn: "date" in n ? n.date : new Date,
            interval: SimileAjax.DateTime.gregorianUnitLengths[n.intervalUnit],
            pixelsPerInterval: n.intervalPixels,
            zones: n.zones,
            theme: r
        }),
        s = new Timeline.HotZoneGregorianEtherPainter({
            unit: n.intervalUnit,
            zones: n.zones,
            theme: r,
            align: "align" in n ? n.align : undefined
        }),
        t = {
            showText: "showEventText" in n ? n.showEventText : !0,
            theme: r
        }, u, f, i;
    if ("eventPainterParams" in n)
        for (u in n.eventPainterParams) t[u] = n.eventPainterParams[u];
    if ("trackHeight" in n && (t.trackHeight = n.trackHeight), "trackGap" in n && (t.trackGap = n.trackGap), f = "overview" in n && n.overview ? "overview" : "layout" in n ? n.layout : "original", "eventPainter" in n) i = new n.eventPainter(t);
    else switch (f) {
    case "overview":
        i = new Timeline.OverviewEventPainter(t);
        break;
    case "detailed":
        i = new Timeline.DetailedEventPainter(t);
        break;
    default:
        i = new Timeline.OriginalEventPainter(t)
    }
    return {
        width: n.width,
        eventSource: e,
        timeZone: "timeZone" in n ? n.timeZone : 0,
        ether: o,
        etherPainter: s,
        eventPainter: i,
        theme: r,
        zoomIndex: "zoomIndex" in n ? n.zoomIndex : 0,
        zoomSteps: "zoomSteps" in n ? n.zoomSteps : null
    }
}, Timeline.getDefaultTheme = function () {
    return Timeline._defaultTheme == null && (Timeline._defaultTheme = Timeline.ClassicTheme.create(Timeline.getDefaultLocale())), Timeline._defaultTheme
}, Timeline.setDefaultTheme = function (n) {
    Timeline._defaultTheme = n
}, Timeline.getTimelineFromID = function (n) {
    return Timeline.timelines[n]
}, Timeline.writeVersion = function (n) {
    document.getElementById(n).innerHTML = this.display_version
}, Timeline._Impl = function (n, t, i, r, u) {
    SimileAjax.WindowManager.initialize(), this._containerDiv = n, this._bandInfos = t, this._orientation = i == null ? Timeline.HORIZONTAL : i, this._unit = r != null ? r : SimileAjax.NativeDateUnit, this._starting = !0, this._autoResizing = !1, this.autoWidth = t && t[0] && t[0].theme && t[0].theme.autoWidth, this.autoWidthAnimationTime = t && t[0] && t[0].theme && t[0].theme.autoWidthAnimationTime, this.timelineID = u, this.timeline_start = t && t[0] && t[0].theme && t[0].theme.timeline_start, this.timeline_stop = t && t[0] && t[0].theme && t[0].theme.timeline_stop, this.timeline_at_start = !1, this.timeline_at_stop = !1, this._initialize()
}, $.extend(Timeline._Impl.prototype, {
    dispose: function () {
        for (var n = 0; n < this._bands.length; n++) this._bands[n].dispose();
        this._bands = null, this._bandInfos = null, this._containerDiv.innerHTML = "", Timeline.timelines[this.timelineID] = null
    },
    getBandCount: function () {
        return this._bands.length
    },
    getBand: function (n) {
        return this._bands[n]
    },
    finishedEventLoading: function () {
        this._autoWidthCheck(!0), this._starting = !1
    },
    layout: function () {
        this._autoWidthCheck(!0), this._distributeWidths()
    },
    paint: function () {
        for (var n = 0; n < this._bands.length; n++) this._bands[n].paint()
    },
    getContainer: function () {
        return this._containerDiv
    },
    cancelFocus: function () {
        var n = this;
        $(this.getContainer()).find(".timeline-band-nofocus").focus()
    },
    getDocument: function () {
        return this._containerDiv.ownerDocument
    },
    addDiv: function (n) {
        this._containerDiv.appendChild(n)
    },
    removeDiv: function (n) {
        this._containerDiv.removeChild(n)
    },
    isHorizontal: function () {
        return this._orientation == Timeline.HORIZONTAL
    },
    isVertical: function () {
        return this._orientation == Timeline.VERTICAL
    },
    getPixelLength: function () {
        return this._orientation == Timeline.HORIZONTAL ? this._containerDiv.offsetWidth : this._containerDiv.offsetHeight
    },
    getPixelWidth: function () {
        return this._orientation == Timeline.VERTICAL ? this._containerDiv.offsetWidth : this._containerDiv.offsetHeight
    },
    getUnit: function () {
        return this._unit
    },
    getWidthStyle: function () {
        return this._orientation == Timeline.HORIZONTAL ? "height" : "width"
    },
    _autoWidthScrollListener: function (n) {
        n.getTimeline()._autoWidthCheck(!1)
    },
    _autoWidthCheck: function (n) {
        function u() {
            var u = t.getWidthStyle(),
                n;
            r ? t._containerDiv.style[u] = i + "px" : (t._autoResizing = !0, n = {}, n[u] = i + "px", SimileAjax.jQuery(t._containerDiv).animate(n, t.autoWidthAnimationTime, "linear", function () {
                t._autoResizing = !1
            }))
        }

        function f() {
            var f = 0,
                e = t.getPixelWidth(),
                r;
            if (!t._autoResizing) {
                for (r = 0; r < t._bands.length; r++) t._bands[r].checkAutoWidth(), f += t._bandInfos[r].width;
                (f > e || n) && (i = f, u(), t._distributeWidths())
            }
        }
        var t = this,
            r = t._starting,
            i = 0;
        t.autoWidth && f()
    },
    _initialize: function () {
        var t = this._containerDiv,
            e = t.ownerDocument,
            u, f, r, n, i;
        for (t.className = t.className.split(" ").concat("timeline-container").join(" "), u = this.isHorizontal() ? "horizontal" : "vertical", t.className += " timeline-" + u; t.firstChild;) t.removeChild(t.firstChild);
        for (this._bands = [], n = 0; n < this._bandInfos.length; n++) f = new Timeline._Band(this, this._bandInfos[n], n), this._bands.push(f);
        for (this._distributeWidths(), n = 0; n < this._bandInfos.length; n++) r = this._bandInfos[n], "syncWith" in r && this._bands[n].setSyncWithBand(this._bands[r.syncWith], "highlight" in r ? r.highlight : !1);
        if (this.autoWidth)
            for (n = 0; n < this._bands.length; n++) this._bands[n].addOnScrollListener(this._autoWidthScrollListener);
        i = SimileAjax.Graphics.createMessageBubble(e), i.containerDiv.className = "timeline-message-container", t.appendChild(i.containerDiv), i.contentDiv.className = "timeline-message", i.contentDiv.innerHTML = "<img src='" + Timeline.urlPrefix + "images/progress-running.gif' /> Loading...", this.showLoadingMessage = function () {
            i.containerDiv.style.display = "block"
        }, this.hideLoadingMessage = function () {
            i.containerDiv.style.display = "none"
        }
    },
    _distributeWidths: function () {
        for (var o = this.getPixelLength(), s = this.getPixelWidth(), u = 0, r, e, n = 0; n < this._bands.length; n++) {
            var f = this._bands[n],
                h = this._bandInfos[n],
                t = h.width,
                i;
            typeof t == "string" ? (r = t.indexOf("%"), r > 0 ? (e = parseInt(t.substr(0, r)), i = Math.round(e * s / 100)) : i = parseInt(t)) : i = t, f.setBandShiftAndWidth(u, i), f.setViewLength(o), u += i
        }
    },
    shiftOK: function (n, t) {
        var f = t > 0,
            o = t < 0,
            e, r, i, u;
        if (f && this.timeline_start == null || o && this.timeline_stop == null || t == 0) return !0;
        for (e = !1, i = 0; i < this._bands.length && !e; i++) e = this._bands[i].busy();
        if (e) return !0;
        if (f && this.timeline_at_start || o && this.timeline_at_stop) return !1;
        for (r = !1, i = 0; i < this._bands.length && !r; i++) u = this._bands[i], r = f ? (i == n ? u.getMinVisibleDateAfterDelta(t) : u.getMinVisibleDate()) >= this.timeline_start : (i == n ? u.getMaxVisibleDateAfterDelta(t) : u.getMaxVisibleDate()) <= this.timeline_stop;
        return f ? (this.timeline_at_start = !r, this.timeline_at_stop = !1) : (this.timeline_at_stop = !r, this.timeline_at_start = !1), r
    },
    zoom: function (n, t, i, r) {
        var e = new RegExp("^timeline-band-([0-9]+)$"),
            u = null,
            f = e.exec(r.id);
        f && (u = parseInt(f[1])), u != null && this._bands[u].zoom(n, t, i, r), this.paint()
    }
})