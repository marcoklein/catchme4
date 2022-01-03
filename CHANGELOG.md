# Changelog

## Unreleased

- create obstacles you can only pass with a boost
- create monsters that move in certain patterns
- create bigger trees you can hide under
- move also with wasd - let client configure inputs
- destroy obstacles by walking against them
- create tiles that accelerate a body

## 0.5.0 Prototype

- [ ] create a lobby scene
- [ ] show remaining catcher time on all clients
- [ ] show movement keys to users

## 0.4.0

- `CatcherTimeRule`: remove player body if it has been catcher for a long time
- particle explosion effect if scene removes player body
- level recreates and changes if only one player is alive
- change level with delay

## 0.3.0

- adding levels
- levels have time limits

## 0.2.0

- show a ping for clients to know their latency
- trees players can hide under
- generate tile map
- bodies collide with tiles
- introduce energy levels of bodies
- players can sprint with `SPACE`
- catcher gets more energy

## 0.1.0

- players can catch each other
- physical world boundaries
- player look into walk direction
- integrate matter js as physics engine
- client can control player bodies
- player synchronizes across clients
