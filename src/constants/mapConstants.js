import {gameDimensions} from "./gameSettings";
//let gameDimensions = {width: 1200, height: 600};

const getStartingPrisons = () => {
    const objs = [];
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

const getCenteredSquare = (side) => {
    const objs = [];
    const startX = 32+(gameDimensions.width/2-side/2*64);
    const startY = 32+(gameDimensions.height/2-side/2*64);
    for(let line = 0; line < side; line++){
        for(let col = 0; col < side; col++){
            if(line===0 || line === side-1){
                objs.push({
                   texture: "block1",
                   killable: true,
                   position: {
                       x: startX+64*col,
                       y: startY+64*line
                   }
                });
            } else {
                if(col===0 || col===side-1){
                    objs.push({
                        texture: "block1",
                        killable: true,
                        position: {
                            x: startX+64*col,
                            y: startY+64*line
                        }
                    });
                }
            }
        }
    }
    return objs;
}

const getMovingSlalom = (number) => {
    const objs = [];
    const gap = (gameDimensions.width-64*number) / (number+1);
    for(let i = 0; i < number; i++){
        objs.push({
            texture: "block2",
            killable: false,
            position: {
                x: gap*(i+1)+64*i+32,
                y: i%2 * 100 + (1-i%2) * (gameDimensions.height-100)
            },
            bounce: 1,
            velocity: {
                x: 0,
                y: 30
            }
        });
    }
    return objs;
}

const getCenteredCross = (gapX, gapY=gapX) => {
    const objs = [];
    //vertical blocks:
    let horizontalDistance = ( gameDimensions.width - gapX ) / 2 - 64 + 32;
    let verticalDistance = ( gameDimensions.height - gapY ) / 2 - 200 + 100;
    for(let i = 0; i < 4; i++){
        objs.push({
           texture: "block2",
           killable: false,
           position: {
               x: (1-i%2) * horizontalDistance + i%2 * (gameDimensions.width-horizontalDistance),
               y: i<2 ? verticalDistance : gameDimensions.height-verticalDistance
           }
        });
    }

    horizontalDistance = ( gameDimensions.width - gapX ) / 2 - 200 + 100;
    verticalDistance = ( gameDimensions.height - gapY ) / 2 - 64 + 32;
    for(let i = 0; i < 4; i++){
        objs.push({
            texture: "block3",
            killable: false,
            position: {
                x: (1-i%2) * horizontalDistance + i%2 * (gameDimensions.width-horizontalDistance),
                y: i<2 ? verticalDistance : gameDimensions.height-verticalDistance
            }
        });
    }

    return objs;
}

const getMixedOrizontalLine = () => {
    const objs = [
        {
            texture: "block3",
            killable: false,
            position: {
                x: 100,
                y: gameDimensions.height/2
            }
        },
        {
            texture: "block3",
            killable: false,
            position: {
                x: gameDimensions.width-100,
                y: gameDimensions.height/2
            }
        }
    ];
    const n = Math.floor((gameDimensions.width - 400 - 64) / 2 / 64);
    for(let i = 1; i < n; i++){
        objs.push({
            texture: "block1",
            killable: true,
            position: {
                x: 200+32+i*64,
                y: gameDimensions.height/2
            }
        });
        objs.push({
            texture: "block1",
            killable: true,
            position: {
                x: gameDimensions.width - (200+32+i*64),
                y: gameDimensions.height/2
            }
        });
    }
    return objs;
}

const getMovingVertical = (n) => {
    const objs = [];
    for(let i = 0; i < n; i++){
        objs.push({
            texture: "block1",
            killable: true,
            position: {
                x: gameDimensions.width/2,
                y: 32+64*i
            },
            velocity: {
                x: 0,
                y: 30
            },
            bounce: 1
        });
    }

    return objs;
}

//console.log(getCenteredCross(100));
export { getStartingPrisons, getCenteredSquare, getMovingSlalom, getCenteredCross, getMovingVertical, getMixedOrizontalLine };