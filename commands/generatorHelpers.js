/**
 * Creates a file object with the specified name, extension, and content.
 *
 * @param name - The name of the file without the extension.
 * @param extension - The file extension.
 * @param content - The content to be included in the file.
 * @returns An object representing the file, with the key being the file name and extension, and the value being the content.
 */
const createFileObject = (name, extension, content) => ({
  [`${name}.${extension}`]: content,
});

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

module.exports = {
  createFileObject,
  capitalize,
};
