class Ball {
	constructor(x, y, diameter = 16) {
		const random = performance.now();

		this.x = x;
		this.y = y;
		this.diameter = diameter;
		const angle = random % Math.PI * 2;
		const acceleration = random % 16 + 16;
		this.dx = Math.cos(angle) * acceleration;
		this.dy = Math.sin(angle) * acceleration;
	}
	update() {
		const isCollided = this.x + this.dx - this.diameter / 2 <= 0 || this.x + this.dx + this.diameter / 2 >= canvas.width || this.y + this.dy - this.diameter / 2 <= 0 || this.y + this.dy + this.diameter / 2 >= canvas.height;
		
		// Bounce off the edges
		if (this.x + this.dx - this.diameter / 2 <= 0 || this.x + this.dx + this.diameter / 2 >= canvas.width) {
			this.dx = -this.dx * 0.35;
		}

		if (this.y + this.dy - this.diameter / 2 <= 0) {
			this.dy = -this.dy * 0.45;
		}
		if(this.y + this.dy + this.diameter / 2 >= canvas.height){
			this.dy = -this.dy * 0.45;
		}			
		else{
			this.dy += gravity;
		}
		if (isCollided) {
			this.dx *= friction;
			this.dy *= friction;
		}

		if (!soundMuted && Math.abs(this.dy) > 1 && isCollided){
			ballBounceSound.play();
		}
		
		this.x += this.dx;
		this.y += this.dy;
	};
};

class ObjectStorage {
	#objects = new Map();
	#i = 0;
	constructor() {

	}
	add(explosion) {
		this.#objects.set(this.#i++, explosion);
	}
	delete(i) {
		return this.#objects.delete(i);
	}
	clear() {
		this.#objects.clear();
	}
	entries() {
		return this.#objects.entries();
	}
	keys() {
		return this.#objects.keys();
	}
	values() {
		return this.#objects.values();
	}
	removeFirst = function* (amount) {
		while (amount-- > 0 && this.size > 0) {
			const key = this.#objects.keys().next().value;
			const object = this.#objects.get(key);

			this.#objects.delete(key);
			yield object;
		}
		return
	};
	get size() {
		return this.#objects.size;
	}
}

class Ticks {
	#i = 0;
	#listeners = new Map();
	#lastTick = performance.now();

	tick(timestamp) {
		const elapsed = timestamp - this.#lastTick;

		calculatedTPS = 1000 / elapsed;

		if (elapsed > 1000 / tps) {
			this.#update();
			this.#i++;
			this.#lastTick = timestamp;
		}
	}
	#update() {
		const ballsAmount = ballStorage.size;

		for (const [_function, interval] of this.#listeners.entries()) {
			if (this.#i % interval === 0) _function();
		}

		if (ballStorage.size !== ballsAmount)
			ballCounter.innerHTML = `Balls count: ${ballStorage.size}`;	
	}
	subscribe(_function, interval) {
		this.#listeners.set(_function, interval);
		return this;
	}
	unsubscribe(_function) {
		this.#listeners.delete(_function);
		return this;
	}
	has(_function) {
		return this.#listeners.has(_function);
	}
};

class AnimFrames {
	#i = 0;
	#listeners = new Map();
	#lastTick = performance.now();

	animFrame(timestamp) {
		const elapsed = timestamp - this.#lastTick;

		calculatedFPS = 1000 / elapsed;

		if (elapsed > 1000 / fps) {
			this.#draw();
			this.#i++;
			this.#lastTick = timestamp;
		}

		window.requestAnimationFrame((timestamp) => this.animFrame(timestamp));
	}
	#draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (const [_function, { interval }] of this.#listeners.entries()) {
			if (this.#i % interval === 0) _function();
		}
	}
	subscribe(_function, interval, priority = Number.MAX_SAFE_INTEGER) {
		const newlistenersOrder = Array.from(this.#listeners.entries());
		newlistenersOrder.push([_function, { interval, priority }]);
		newlistenersOrder.sort(([, a], [, b]) => a.priority - b.priority);
		this.#listeners = new Map(newlistenersOrder);
		return this;
	}
	unsubscribe(_function) {
		this.#listeners.delete(_function);
		return this;
	}
	has(_function) {
		return this.#listeners.has(_function);
	}
	getPriority(_function) {
		return this.#listeners.get(_function).priority;
	}
};

// ???????????????????? SoundQueue ?? SoundEntity
// ?????????????? ??????????, ?????? ?????? ?? ???????????? ???????????????? ?????? ???????????? ???????????????????????? ?????? ???????????? ???? ????????????
class SoundEntity
{
	constructor(clipSrc){
		this.clipSrc = clipSrc;
	}

	play(){
		if (globalSoundsCounter < soundLimiter){
			const ac = new Audio(this.clipSrc);
			ac.addEventListener('ended', () => {
				globalSoundsCounter--;
			});
            ac.play();
			globalSoundsCounter++;
		}
	}
}
