# Domain Specific Language For Card Games

## How to use the library
        
**players!** — Initializes players:
```rust
players!(cgm: &mut CardGameModel, playername1: String, playername2: String);
```
        
**team!** — Initializes a team:

```rust
team!(cgm: &mut CardGameModel, teamname: String, (player1: String, player2: String));
```
        
**location_on!** — Initializes locations:
```rust
location_on!(locationname: String, players: Vec<Rc<RefCell<Player>>>);
location_on!(locationname: String, team: &Team);
location_on!(locationname: String, table: &Table);
```
        
**card_on!** — Sets cards on a location:
```rust
card_on!(cgm: &mut CardGameModel, location: String, ...);
```
        
**precedence!** — Sets precedence for key:
```rust
precedence!(cgm: &mut CardGameModel, (Key: String, (v1: String, v2: String, ...)));
```
        
**pointmap!** — Define nested pointmap:
```rust
pointmap!(cgm: &mut CardGameModel, nested: 
    (keyname,
        (
        valname1 => [i32],
        valname2 => [i32],
        ...
        )
    )
);
```
        
**pointmap!** — Define flat pointmap:
```rust
pointmap!(cgm: &mut CardGameModel, list: 
    (
        (keyname1, valname1) => [i32],
        (keyname2, valname2) => [i32],
        ...
    )
);
```
        
**turnorder!** — Set turn order:
```rust
turnorder!(cgm: &mut CardGameModel, players: Vec<Rc<RefCell<Player>>>);
turnorder!(cgm: &mut CardGameModel, players: Vec<Rc<RefCell<Player>>>, random);
```
        
**filter!** — See documentation in code.

