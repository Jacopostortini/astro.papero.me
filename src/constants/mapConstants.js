import {gameDimensions} from "./gameSettings";
//let gameDimensions = {width: 1200, height: 600};

const getStartingPrisons = () => {
    let objs = [];
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 5; j++) {
            objs.push({
                texture: "block1",
                killable: true,
                position: {
                    x: ( 160 - (j>2 ? 64*(j-2) : 0) ) * (1-i%2)   +   (gameDimensions.width-160 + (j>2 ? 64*(j-2) : 0) ) * (i%2),
                    y: i<2 ? ( 32 + Math.min(j*64, 128) ) :  (gameDimensions.height-32 - Math.min(j*64, 128))
                }
            });
        }
    }
    return objs;

}

//getStartingPrisons();

export { getStartingPrisons };