"use strict";

var _typeof =
    typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
        ? function (obj) {
            return typeof obj;
        }
        : function (obj) {
            return obj &&
            typeof Symbol === "function" &&
            obj.constructor === Symbol &&
            obj !== Symbol.prototype
                ? "symbol"
                : typeof obj;
        };

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    } else {
        return Array.from(arr);
    }
}

/*!
 * Test plugin for Editor.md
 *
 * @file        Mind Map
 * @author      pandao
 * @version     1.2.0
 * @updateTime  2015-03-07
 * {@link       https://github.com/pandao/editor.md}
 * @license     MIT
 */

(function () {
    var factory = function factory(exports) {
        var treeProperties = {
            textFilter: {label: "Text Filter (regex)", type: "text", val: "."},
            fontSize: {
                label: "Font size",
                model: "fontSize",
                min: 5,
                max: 50,
                val: 13
            },
            connectorWidth: {
                label: "Connector width",
                model: "connectorWidth",
                min: 20,
                max: 100,
                val: 65
            },
            connectorSteepness: {
                label: "Connector steepness",
                min: 0.1,
                max: 1,
                step: 0.01,
                val: 0.65
            },
            connectorLineWidth: {
                label: "Line width",
                min: 0.5,
                max: 10,
                step: 0.25,
                val: 4.5
            },
            nodeMarginTop: {label: " Top margin", min: 0, max: 50, val: 5},
            nodeMarginBottom: {label: " Bottom margin", min: 0, max: 50, val: 5},
            useGrayscale: {label: "Use grayscale", type: "boolean", val: 0}
        };
        var textFilter = new RegExp(".+");

        var $ = jQuery; // if using module loader(Require.js/Sea.js).
        var pluginName = "mindmap";

        // exports.fn.testMind = function(p1, p2) {
        //     console.log("testMind");
        // }
        var currentTree;
        $.fn.drawMind = function () {
            for (var i = 0; i < this.length; i++) {
                //text, domItem
                // console.log("drawMind ", $(this).find("canvas"), $(this).find(".mindTxt"));
                // return;
                var text = $(this).find(".mindTxt")[i].innerText;
                //console.log($(this).find(".mindTxt")[i].innerText);
                //console.log($(this).find(".mindTxt").text())
                try {
                    var parsed = parseList(text);
                } catch (err) {
                    console.log("Woops! Error parsing");
                    return;
                }
                $(this).find(".mindTxt").hide();
                if (parsed.children.length === 0) {
                    return;
                }
                parsed = parsed.children[0];
                currentTree = parseObjectBranch(parsed, true);

                //console.log($(this).find("canvas").length);

                //console.log($(this).find("canvas")[i]);
                regenerateDiagram($(this).find("canvas")[i]);

                // console.log("drawMind", text, parsed, domItem);
            }
        };

        var parseObjectBranch = function parseObjectBranch(branch) {
            var isRoot =
                arguments.length > 1 && arguments[1] !== undefined
                    ? arguments[1]
                    : false;

            var node = new TreeNode(branch.label, isRoot);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (
                    var _iterator = branch.children[Symbol.iterator](), _step;
                    !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                    _iteratorNormalCompletion = true
                ) {
                    var child = _step.value;

                    if (textFilter.test(child.label)) {
                        node.addChild(parseObjectBranch(child, false));
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return node;
        };

        var regenerateDiagram = function regenerateDiagram(canvas) {
            //var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");

            if (!(currentTree instanceof TreeNode)) {
                console.log("Not a valid tree", currentTree);
                return;
            }

            // Draw the map
            var beautifulDrawing = currentTree.draw();

            // Resize canvas to the size of the map plus some margin
            canvas.width = beautifulDrawing.width + 25;
            canvas.height = beautifulDrawing.height + 25;

            // console.log("Canvas", canvas.width, canvas.height);

            // Draw the map onto the existing canvas
            ctx.drawImage(beautifulDrawing, 25, 25);
        };

        function parseList(text) {
            var items = {label: "ROOT", children: [], depth: -1};
            var lines = text.split("\n");
            lines = lines.filter(function (c) {
                return !c.match(/^\s*$/);
            }); // Remove blank lines

            var currentParent = items;
            var currentParentDepth = -1;

            var currentItemLabel = "";
            var currentItemDepth;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (
                    var _iterator2 = lines[Symbol.iterator](), _step2;
                    !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done);
                    _iteratorNormalCompletion2 = true
                ) {
                    var line = _step2.value;

                    var itemMatch = line.match(/^( *)-\s*(.*)$/);

                    // New item
                    if (itemMatch) {
                        // Store previous item (if any)
                        if (currentItemLabel != "") {
                            // Build the node for the previously read node
                            var node = {
                                label: currentItemLabel,
                                children: [],
                                parent: currentParent,
                                depth: currentItemDepth
                            };

                            // Store the node within its parent
                            currentParent["children"].push(node);

                            // Set the new "parent" to the previous item
                            currentParent = node;
                            currentParentDepth = node.depth;
                        }

                        // Fetch the data from the newly-read item
                        currentItemDepth = itemMatch[1].length;
                        currentItemLabel = itemMatch[2];

                        // If the parent is deeper than the new item, switch the parent
                        // to one with lower depth than current item
                        while (currentItemDepth <= currentParentDepth) {
                            currentParent = currentParent["parent"];
                            currentParentDepth = currentParent["depth"];
                        }
                    } else {
                        // Continued string from previous item
                        currentItemLabel += "\n" + line;
                    }
                }

                // Force insert last item
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            if (currentItemLabel) {
                var node = {
                    label: currentItemLabel,
                    children: [],
                    parent: currentParent,
                    depth: currentParentDepth + 1
                };
                currentParent["children"].push(node);
            }

            return items;
        }

        var fontFamily = "Open Sans";
        var labelPaddingBottom = 8;
        var labelPaddingRight = 10;
        var DEBUG = false;

        function TreeNode(label) {
            var isRoot =
                arguments.length > 1 && arguments[1] !== undefined
                    ? arguments[1]
                    : false;

            this.label = label;
            this.labelLines = this.label.split("\n");
            this.isRoot = isRoot;
            this.parent = undefined;
            this.children = [];

            this.isLeaf = function () {
                return this.children.length == 0;
            };

            this.addChild = function (child) {
                child.parent = this;
                this.children.push(child);
            };

            this.addChildren = function () {
                for (
                    var _len = arguments.length, children = Array(_len), _key = 0;
                    _key < _len;
                    _key++
                ) {
                    children[_key] = arguments[_key];
                }

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (
                        var _iterator3 = children[Symbol.iterator](), _step3;
                        !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done);
                        _iteratorNormalCompletion3 = true
                    ) {
                        var child = _step3.value;

                        this.addChild(child);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            };

            this.draw = function (currentBranchColor) {
                var _this = this;

                var that = this;

                var dl = function dl(x, y) {
                    var c =
                        arguments.length > 2 && arguments[2] !== undefined
                            ? arguments[2]
                            : "#00ff00";
                    var w =
                        arguments.length > 3 && arguments[3] !== undefined
                            ? arguments[3]
                            : 100;

                    that.ctx.fillStyle = c;
                    that.ctx.fillRect(x, y, w, 1);
                };

                var dr = function dr(x, y, w, h) {
                    var c =
                        arguments.length > 4 && arguments[4] !== undefined
                            ? arguments[4]
                            : "#00ff00";

                    that.ctx.lineWidth = 1;
                    that.ctx.strokeStyle = c;
                    that.ctx.rect(x, y, w, h);
                    that.ctx.stroke();
                };

                this.canvas = document.createElement("canvas");
                this.ctx = this.canvas.getContext("2d");

                // The width of the label will be the width of the widest line
                this.ctx.font = treeProperties.fontSize.val + "px " + fontFamily;

                // The height of the lines of text (only)
                this.textHeight = treeProperties.fontSize.val * this.labelLines.length;

                // The height of the text + the separation from the line + the line height + the label margin
                this.composedHeight =
                    this.textHeight +
                    labelPaddingBottom +
                    treeProperties.connectorLineWidth.val;

                // The composed height plus the margin
                this.paddedHeight =
                    this.composedHeight + treeProperties.nodeMarginTop.val;

                this.labelHeight =
                    treeProperties.nodeMarginTop.val + // top margin
                    treeProperties.fontSize.val * (this.labelLines.length + 1) + // text lines' height
                    treeProperties.nodeMarginBottom.val; // bottom margin

                this.labelWidth = Math.ceil(
                    Math.max.apply(
                        Math,
                        _toConsumableArray(
                            this.labelLines.map(function (c) {
                                return _this.ctx.measureText(c).width;
                            })
                        )
                    )
                );

                if (this.isLeaf()) {
                    // Resize the canvas
                    this.canvas.width = this.labelWidth + labelPaddingRight * 2;
                    this.canvas.height = this.labelHeight;

                    // Set the font
                    this.ctx.font = treeProperties.fontSize.val + "px " + fontFamily;

                    // Draw the text lines
                    for (var i = 0; i < this.labelLines.length; i++) {
                        this.ctx.fillText(
                            this.labelLines[i],
                            0,
                            treeProperties.fontSize.val * (i + 1) +
                            treeProperties.nodeMarginTop.val
                        );
                    }

                    // The anchorPoint defines where the line should start
                    this.anchorPoint = {
                        x: 0,
                        y:
                        this.labelLines.length * treeProperties.fontSize.val +
                        labelPaddingBottom +
                        treeProperties.nodeMarginTop.val
                    };
                } else {
                    // If this is the root, we need to generate a random color for each branch
                    if (this.isRoot) {
                        var branchColors = this.children.map(function (c) {
                            return generateRandomColor(treeProperties.useGrayscale);
                        });
                        var canvases = this.children.map(function (c, i) {
                            return c.draw(branchColors[i]);
                        });
                    } else {
                        // Otherwise, use the received branchColor
                        var canvases = this.children.map(function (c, i) {
                            return c.draw(currentBranchColor);
                        });
                    }

                    // Get the vertical positions for the children
                    var childrenVerticalPositions = [0];

                    // Each position is the sum of the acumulated heights of the previous elements
                    for (var i = 0; i < canvases.length; i++) {
                        childrenVerticalPositions[i + 1] =
                            childrenVerticalPositions[i] + canvases[i].height;
                    }

                    var childrenHeight = childrenVerticalPositions[canvases.length];

                    this.anchorPoint = {x: this.isRoot ? 10 : 0, y: 0};

                    /*
                               If the height of the children is smaller than the height of the node, take the height of the node and
                               don't center it vertically.
                               Otherwise, take the max between 2*height of the node and the children height, and center it vertically.
                               */

                    if (
                        childrenHeight <
                        this.composedHeight + treeProperties.nodeMarginTop.val * 2
                    ) {
                        this.canvas.height =
                            this.composedHeight + treeProperties.nodeMarginTop.val * 2;
                        this.anchorPoint.y =
                            this.canvas.height / 2 + this.composedHeight / 2;
                    } else {
                        this.canvas.height = Math.max(
                            childrenVerticalPositions[canvases.length],
                            this.composedHeight * 2
                        );
                        this.anchorPoint.y = this.canvas.height / 2;
                    }

                    // console.log(this.label, this.canvas.height, childrenVerticalPositions[canvases.length]);

                    // Compute left margin (label width + separation)
                    var leftMargin =
                        10 + this.labelWidth + treeProperties.connectorWidth.val;

                    // Set the width to the leftMargin plus the width of the widest child branch
                    this.canvas.width =
                        leftMargin +
                        Math.max.apply(
                            Math,
                            _toConsumableArray(
                                canvases.map(function (c) {
                                    return c.width;
                                })
                            )
                        );
                    this.ctx.font = treeProperties.fontSize.val + "px " + fontFamily;

                    // Draw each child
                    for (var i = 0; i < canvases.length; i++) {
                        if (this.isRoot) {
                            currentBranchColor = branchColors[i];
                        }

                        this.ctx.drawImage(
                            canvases[i],
                            leftMargin,
                            childrenVerticalPositions[i]
                        );

                        var connector_a = {
                            x: this.anchorPoint.x + this.labelWidth + labelPaddingRight,
                            y: this.anchorPoint.y
                        };

                        var connector_b = {
                            x: leftMargin,
                            y: childrenVerticalPositions[i] + this.children[i].anchorPoint.y
                        };

                        this.ctx.beginPath();
                        this.ctx.moveTo(connector_a.x, connector_a.y);

                        this.ctx.bezierCurveTo(
                            connector_a.x +
                            treeProperties.connectorSteepness.val *
                            treeProperties.connectorWidth.val,
                            connector_a.y,
                            connector_b.x -
                            treeProperties.connectorSteepness.val *
                            treeProperties.connectorWidth.val,
                            connector_b.y,
                            connector_b.x,
                            connector_b.y
                        );

                        this.ctx.lineTo(
                            connector_b.x + this.children[i].labelWidth + labelPaddingRight,
                            connector_b.y
                        );
                        this.ctx.lineWidth = treeProperties.connectorLineWidth.val;
                        this.ctx.lineCap = "round";
                        this.ctx.strokeStyle = currentBranchColor;
                        this.ctx.stroke();
                    }

                    // For the root node, print a containing rectangle and always center the text
                    if (this.isRoot) {
                        this.ctx.fillStyle = "#ffffff";
                        this.ctx.lineWidth = 3;
                        roundRect(
                            this.ctx,
                            2,
                            this.canvas.height / 2 -
                            this.labelLines.length * treeProperties.fontSize.val,
                            this.labelWidth + 18,
                            treeProperties.fontSize.val * (this.labelLines.length + 1.5),
                            5,
                            true,
                            true
                        );

                        this.ctx.fillStyle = "#000000";

                        for (var i = 0; i < this.labelLines.length; i++) {
                            this.ctx.fillText(
                                this.labelLines[i],
                                10, // Fixed margin from the left
                                this.canvas.height / 2 + // Vertical center
                                treeProperties.fontSize.val / 2 - // Middle of the line height
                                treeProperties.fontSize.val * (this.labelLines.length - i - 1) // Correctly account for multilines
                            );
                        }
                    } else {
                        this.ctx.fillStyle = "#000000";

                        for (var i = 0; i < this.labelLines.length; i++) {
                            this.ctx.fillText(
                                this.labelLines[i],
                                10, // Fixed margin from the left
                                this.anchorPoint.y - // From the anchor point
                                labelPaddingBottom - // Move up the padding
                                treeProperties.fontSize.val * (this.labelLines.length - i - 1)
                            );
                        }
                    }
                }

                if (DEBUG) {
                    dr(1, 1, this.canvas.width - 1, this.canvas.height - 1);
                }

                return this.canvas;
            };
        }

        function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
            if (typeof stroke == "undefined") {
                stroke = true;
            }
            if (typeof radius === "undefined") {
                radius = 5;
            }
            if (typeof radius === "number") {
                radius = {tl: radius, tr: radius, br: radius, bl: radius};
            } else {
                var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
                for (var side in defaultRadius) {
                    radius[side] = radius[side] || defaultRadius[side];
                }
            }
            ctx.beginPath();
            ctx.moveTo(x + radius.tl, y);
            ctx.lineTo(x + width - radius.tr, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
            ctx.lineTo(x + width, y + height - radius.br);
            ctx.quadraticCurveTo(
                x + width,
                y + height,
                x + width - radius.br,
                y + height
            );
            ctx.lineTo(x + radius.bl, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
            ctx.lineTo(x, y + radius.tl);
            ctx.quadraticCurveTo(x, y, x + radius.tl, y);
            ctx.closePath();
            if (fill) {
                ctx.fill();
            }
            if (stroke) {
                ctx.stroke();
            }
        }

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        function generateRandomColor(useGrayscale) {
            var baseColor = [256, 256, 256];
            var red = getRandomInt(0, 256);
            var green = getRandomInt(0, 256);
            var blue = getRandomInt(0, 256);

            // mix the color

            var mixture = 0.7;

            red = Math.round(red * mixture + baseColor[0] * (1 - mixture));
            green = Math.round(green * mixture + baseColor[1] * (1 - mixture));
            blue = Math.round(blue * mixture + baseColor[2] * (1 - mixture));

            if (useGrayscale.val == 1) {
                return rgbToHex(red, red, red);
            } else {
                return rgbToHex(red, green, blue);
            }
        }

        function getLoremIpsum() {
            var numWords =
                arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;

            var baseText =
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida eu leo vitae imperdiet. Nam pulvinar luctus arcu, vel semper ligula efficitur in. Mauris non semper ante. Nullam scelerisque hendrerit urna, lacinia egestas enim laoreet vitae. Aliquam erat volutpat. Duis posuere magna libero, vel rhoncus nisl ullamcorper eu. Etiam ac libero consectetur, congue nisi quis, vulputate erat.";
            var sentences = baseText.split(".");
            var sentences_words = sentences.map(function (s) {
                return s.split(/[\s\.,]/);
            });

            var chosenSentenceNumber = getRandomInt(0, sentences.length - 1);
            var chosenWords = sentences_words[chosenSentenceNumber]
                .slice(0, numWords)
                .join(" ");

            return chosenWords;
        }
    };

    // CommonJS/Node.js
    if (
        typeof require === "function" &&
        (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ===
        "object" &&
        (typeof module === "undefined" ? "undefined" : _typeof(module)) === "object"
    ) {
        module.exports = factory;
    } else if (typeof define === "function") {
        // AMD/CMD/Sea.js
        if (define.amd) {
            // for Require.js

            define(["editormd"], function (editormd) {
                factory(editormd);
            });
        } else {
            // for Sea.js
            define(function (require) {
                var editormd = require("./../editormd.min");
                factory(editormd);
            });
        }
    } else {
        factory(window.editormd);
    }
})();
