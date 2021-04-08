const maps = [
    [
        {
            texture: "block1",
            position: {
                x: 50,
                y: 20
            }
        },
        {
            texture: "block1",
            position: {
                x: 100,
                y: 20
            }
        },
        {
            texture: "block1",
            position: {
                x: 250,
                y: 20
            }
        }/*,
        {
            type: "block2",
            position: [200, 200]
        },
        {
            type: "block2",
            position: [200, 200]
        },
        {
            type: "block2",
            position: [200, 200]
        }*/
    ],
];

export default (ctx) => {
    const map = maps[0];
    ctx.mapObjetcs = ctx.physics.add.staticGroup();
    map.forEach(obj => {
       ctx.mapObjetcs.create(obj.position.x, obj.position.y, obj.texture);
       ctx.physics.add.collider(ctx.mapObjetcs, ctx.ships);
        ctx.physics.add.collider(ctx.mapObjetcs, ctx.bullets, (obj, bullet) => {
            bullet.destroy();
        });
    });
};