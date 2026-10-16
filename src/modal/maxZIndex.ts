/**
 * Highest z-index in use among the elements of the given tag name.
 * `z-index: auto` computes to a non numeric value - it is ignored.
 */
export function findHighestZIndex(elem: string): number {
    const elems = document.getElementsByTagName(elem);
    const view = document.defaultView;
    if (!view) {
        return 0;
    }
    let highest = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < elems.length; i++) {
        const index = Number.parseInt(
            view.getComputedStyle(elems[i], null).getPropertyValue("z-index"),
            10
        );
        if (!Number.isNaN(index) && index > highest) {
            highest = index;
        }
    }
    return highest === Number.MIN_SAFE_INTEGER ? 0 : highest;
}
