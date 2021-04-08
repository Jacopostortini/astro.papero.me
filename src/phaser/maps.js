const maps = [
    [
        {
            texture: "block1",
            position: {
                x: 128+32,
                y: 32
            }
        },
        {
            texture: "block1",
            position: {
                x: 128+32,
                y: 64+32
            }
        },
        {
            texture: "block1",
            position: {
                x: 128+32,
                y: 128+32
            }
        },
        {
            texture: "block1",
            position: {
                x: 64+32,
                y: 128+32
            }
        },
        {
            texture: "block1",
            position: {
                x: 0,
                y: 128+32
            }
        }
    ],
];

export default (ctx) => {
    const map = maps[0];
    ctx.mapObjetcs = ctx.physics.add.staticGroup();
    map.forEach(obj => {
       ctx.mapObjetcs.create(obj.position.x, obj.position.y, obj.texture);
       ctx.physics.add.collider(ctx.mapObjetcs, ctx.ships);
        ctx.physics.add.collider(ctx.mapObjetcs, ctx.bullets, (obj, bullet) => {
            obj.destroy();
            bullet.destroy();
        });
    });
};