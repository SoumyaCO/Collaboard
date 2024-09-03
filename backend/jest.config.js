/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
	testEnvironment: "node",
	transform: {
		"^.+.tsx?$": ["ts-jest", {}],
	},
	testPathIgnorePatterns: [
		"/node_modules/",
		"/__tests__/test_utils/",
		"/__tests__/socket_tests/",
	],
};
