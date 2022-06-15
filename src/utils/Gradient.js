import Gradient from 'javascript-color-gradient';


export let CaseGradient = (amount) => {

    let scale = new Gradient();

    scale.setGradient('#ffeeee','#FF5454').setMidpoint(250);

    if(amount == null || amount == 'NaN') {
        selectedColor = '#999';
    } else {
        return scale.getColor(amount > 0 ? amount : 1);
    }

    return selectedColor;

}