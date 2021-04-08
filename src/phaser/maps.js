const maps = [
    [
        {
            texture: "block1",
            position: {
                x: 128,
                y: 0
            }
        },
        {
            texture: "block1",
            position: {
                x: 128,
                y: 64
            }
        },
        {
            texture: "block1",
            position: {
                x: 128,
                y: 128
            }
        },
        {
            texture: "block1",
            position: {
                x: 64,
                y: 128
            }
        },
        {
            texture: "block1",
            position: {
                x: 0,
                y: 128
            }
        }
    ],
];

export default (ctx) => {
    const map = maps[0];
    ctx.mapObjetcs = ctx.physics.add.staticGroup();
    map.forEach(obj => {
       ctx.mapObjetcs.create(obj.position.x, obj.position.y, obj.texture).setOrigin(0, 0);
       ctx.physics.add.collider(ctx.mapObjetcs, ctx.ships);
        ctx.physics.add.collider(ctx.mapObjetcs, ctx.bullets, (obj, bullet) => {
            obj.destroy();
            bullet.destroy();
        });
    });
};