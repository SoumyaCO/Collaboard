const alphabets = "abcdefghijklmnopqrstuvwxyz0123456789";

type User = {
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};

/**
 * Generates random username
 * @param n {Number} - length of random username
 * @returns usernname {string} - username
 */
export function randomUserName(n: number): string {
	let username: string = "";
	for (let i = 0; i < n; ++i) {
		let char: string =
			alphabets[Math.floor(Math.random() * alphabets.length + 1)];
		username += char;
	}
	return username;
}

/**
 * Generated random first and last names
 * @param n {Number} - length of random name
 * @returns name {string} - name
 */
export function randomName(n: number): string {
	let name: string = "";
	for (let i = 0; i < n; ++i) {
		let char: string =
			alphabets[Math.floor(Math.random() * alphabets.length + 1)];
		name += char;
	}
	return name;
}

/**
 * Generates random email address
 * @param n {Number} - length of random email
 * @returns email {string} - email
 */

export function randomEmail(n: number): string {
	let email: string = "";
	for (let i = 0; i < n; ++i) {
		let char: string =
			alphabets[Math.floor(Math.random() * alphabets.length + 1)];
		email += char;
	}
	email += "@test.mail.com";
	return email;
}

/**
 * Generates random passwords
 * @param n {Number} - length of password
 * @returns pass {string} - password
 */

export function randomPass(n: number): string {
	let pass: string = "";
	for (let i = 0; i < n; ++i) {
		let char: string =
			alphabets[Math.floor(Math.random() * alphabets.length + 1)];
		pass += char;
	}
	return pass;
}

/**
 * Generates a full user with random credentials
 * @returns user {Object}
 */
export function randomUser(): User {
	const len = 6;
	let user: User = {
		username: randomUserName(len),
		firstName: randomName(len),
		lastName: randomName(len),
		email: randomEmail(len),
		password: randomPass(len),
	};
	return user;
}
