/*
 *  Waltz
 * Copyright (c) David Watkins. All rights reserved.
 * The use and distribution terms for this software are covered by the
 * Eclipse Public License 1.0 (http://opensource.org/licenses/eclipse-1.0.php)
 * which can be found in the file epl-v10.html at the root of this distribution.
 * By using this software in any fashion, you are agreeing to be bound by
 * the terms of this license.
 * You must not remove this notice, or any other, from this software.
 *
 */

import {assert} from "chai";
import {notEmpty, perhaps, randomPick} from "../../client/common";



describe("Common", () => {

    describe("notEmpty", () => {

        it("returns true if an array or string is not empty", () => {
            assert(notEmpty([1]));
            assert(notEmpty("hello"));
        });

        it("returns false if an array or string is empty", () => {
            assert.isFalse(notEmpty([]));
            assert.isFalse(notEmpty(""));
            assert.isFalse(notEmpty(null));
        });
    });

    describe("perhaps", () => {

        it("gives the result of calling `fn()` as long as `fn` does not throw an error", () => {
            assert.equal(4, perhaps(() => 2 + 2, -1));
        });

        it("gives the default value if  `fn()` throws an error", () => {
            assert.equal(-1, perhaps(() => { throw "bang"; }, -1));
        });

    });

    describe("randomPick", () => {

        it("returns the only element of a one element array", () => {
            assert.equal(3, randomPick([3]));
        });

        it("returns null from a zero element array", () => {
            assert.equal(null, randomPick([]));
        });

        it("throws with a null array", () => {
            assert.throws(() => randomPick());
        });

    });

});
