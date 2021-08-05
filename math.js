/**
 * Construct a vector to hold an x and y component
 * @param {number} x
 * @param {number} y 
 */
 function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.distanceSquared = function(vector) {
    let dx = this.x - vector.x, dy = this.y - vector.y;
    return dx * dx + dy * dy;
}

Vector.prototype.distance = function(vector) {
    return Math.sqrt(this.distanceSquared(vector));
}

Vector.prototype.dot = function(vector) {
    return this.x * vector.x + this.y * vector.y;
}

/**
 * Generates a random floating-point number between [a, b)
 * @param {number} a 
 * @param {number} b 
 * @returns Random number between [a, b)
 */
function random(a, b) {
    return Math.random() * (b - a) + a;
}

/**
 * Returns the angle within the domain [0, 2pi)
 * @param {number} angle Angle in radians
 */
function restrictAngleDomain(angle) {
    if (angle < 0)
        angle = 2 * Math.PI - (-angle % (2 * Math.PI))
    if (angle >= 2 * Math.PI)
        angle %= 2 * Math.PI;
    return angle;
}

/**
 * Checks if the given angle is within the smaller
 * portion of the angular region defined by the bounds t0 to t1
 * @param {number} t0 in radians
 * @param {number} t1 in radians
 * @param {number} angle in radians
 */
function inAngle(t0, t1, angle) {
    angle = restrictAngleDomain(angle);
    t0 = restrictAngleDomain(t0);
    t1 = restrictAngleDomain(t1);
    if (t0 > t1) {
        let temp = t1;
        t1 = t0;
        t0 = temp;
    }
    if (t1 - t0 > Math.PI) { // check the split section
        return angle <= t0 || angle >= t1;
    } else { // check the closed section
        return angle >= t0 && angle <= t1;
    }
}

/**
 * Returns a position vector of where the two segments intersect.
 * Returns null if the segments do not intersect.
 * 
 * Utilizes some foolery of the cross-product.
 * @param {Vector} p1 Endpoint 1 of segment 1
 * @param {Vector} q1 Endpoint 2 of segment 1
 * @param {Vector} p2 Endpoint 1 of segment 2
 * @param {Vector} q2 Endpoint 2 of segment 2
 */
function intersects(p1, q1, p2, q2) {
    let s1 = new Vector(q1.x - p1.x, q1.y - p1.y);
    let s2 = new Vector(q2.x - p2.x, q2.y - p2.y);

    let s = (-s1.y * (p1.x - p2.x) + s1.x * (p1.y - p2.y)) / (-s2.x * s1.y + s1.x * s2.y);
    let t = ( s2.x * (p1.y - p2.y) - s2.y * (p1.x - p2.x)) / (-s2.x * s1.y + s1.x * s2.y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return new Vector(p1.x + (t * s1.x), p1.y + (t * s1.y));
    } else {
        return null; // No collision
    }
}

function formatNumber(number, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
}