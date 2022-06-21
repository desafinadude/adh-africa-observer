import Gradient from 'javascript-color-gradient';


export let CaseGradient = (amount, midpoint) => {

    let midpoint_set = midpoint == undefined ? 250 : midpoint;

    let scale = new Gradient();

    scale.setGradient('#ffeeee', '#FF5454').setMidpoint(midpoint_set);

    if (amount == null || amount == 'NaN') {
        selectedColor = '#999';
    } else {
        return scale.getColor(amount > 0 ? amount : 1);
    }

    return selectedColor;

}