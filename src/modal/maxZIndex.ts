 export function findHighestZIndex(elem:string)
{
    const elems = document.getElementsByTagName(elem);
    let highest = Number.MIN_SAFE_INTEGER || -(Math.pow(2, 53) - 1);
    for (let i = 0; i < elems.length; i++)
    {
        var index = Number.parseInt(
            document.defaultView!.getComputedStyle(elems[i], null).getPropertyValue("z-index"),
            10
        );
        if (index > highest)
        {
            highest = index;
        }
    }
    return highest;
}