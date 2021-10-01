export function capitalize(str) {
    if (typeof str === 'string' && str.length > 0) {
        return str.slice(0,1).toUpperCase() + str.slice(1);
    } else {
        return str
    }
}