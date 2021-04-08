const maps = [
    [
        {
            texture: "block1",
            killable: true,
            position: {
                x: 160,
                y: 32
            }
        },
        {
            texture: "block1",
            killable: true,
            position: {
                x: 160,
                y: 96
            }
        },
        {
            texture: "block1",
            killable: true,
            position: {
                x: 160,
                y: 160
            }
        },
        {
            texture: "block1",
            killable: true,
            position: {
                x: 96,
                y: 160
            }
        },
        {
            texture: "block1",
            killable: true,
            position: {
                x: 32,
                y: 160
            }
        },
        
        

        {
            texture: "block1",
            killable: true,
            position: {
                x: 160,
                y: 568
            }
        },
        {
            texture: "block1",
            killable: true,
            position: {
                x: 160,
                y: 504
            }
        },
        {
            texture: "block1",
            killable: true,
            position: {
                x: 160,
                y: 440
            }
        },
        {
            texture: "block1",
            killable: true,
            position: {
                x: 96,
                y: 440
            }
        },
        {
            texture: "block1",
            killable: true,
            position: {
                x: 32,
                y: 440
            }
        },


        {
            texture: "block2",
            killable: false,
            position: {
                x: 600,
                y: 300
            }
        }
    ],
];

export default (ctx) => {
    const map = maps[0];
    ctx.killableMapObjects = ctx.physics.add.staticGroup();
    ctx.notKillableMapObjects = ctx.physics.add.staticGroup();
    map.forEach(obj => {
       if(obj.killable){
           ctx.killableMapObjects.create(obj.position.x, obj.position.y, obj.texture);
       } else {
           ctx.notKillableMapObjects.create(obj.position.x, obj.position.y, obj.texture);
       }
    });
    ctx.physics.add.collider(ctx.killableMapObjects, ctx.ships);
    ctx.physics.add.collider(ctx.notKillableMapObjects, ctx.ships);
    ctx.physics.add.overlap(ctx.killableMapObjects, ctx.bullets, (obj, bullet) => {
        obj.destroy();
        bullet.destroy();
    });
    ctx.physics.add.overlap(ctx.notKillableMapObjects, ctx.bullets, (obj, bullet) => {
        bullet.destroy();
    });
};