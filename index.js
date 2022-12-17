const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight*0.8


// Graphics objects
const santaSpriteArray = [
    document.getElementById('santa_anim1'),
    document.getElementById('santa_anim2'),
    document.getElementById('santa_anim3'),
    document.getElementById('santa_anim4'),
    document.getElementById('santa_anim5'),
    document.getElementById('santa_anim6'),
    document.getElementById('santa_anim7'),
    document.getElementById('santa_anim8'),
    document.getElementById('santa_anim9'),
    document.getElementById('santa_anim10'),
    document.getElementById('santa_anim11'), 
]
const background = document.getElementById('backgroundSprite')
const platformSprite = document.getElementById('platformSprite')
const sleighSprite = document.getElementById('sleigSprite')
const iceSprite = document.getElementById('iceSprite')
const snowmanSprite = document.getElementById('snowmanSprite')
const treeSprite = document.getElementById('treeSprite')
const giftSprite = document.getElementById('giftSprite')
const gameOverSprite = document.getElementById('gameOverSprite')

class Player {
    constructor({sprite : spriteArray}) {
        this.sprite = spriteArray
        this.frameCounter = 0
        this.currentFrame = 0;
        this.position = {x:-150, y: canvas.height-200}
        this.width = 140
        this.height = 160
        this.velocity = {x:0, y:0}
    }
    draw() {
        context.drawImage(this.sprite[this.currentFrame], this.position.x, this.position.y, this.width, this.height)
    }
    skipFrames(frames){
        if (this.frameCounter % frames == 0){
            this.currentFrame++
        }
    }
    resetFrameCounter(){
        if(this.currentFrame == this.sprite.length){
            this.currentFrame = 0
        }
    }
    offsetCamera(xPositionInPercents){
        if(this.position.x > (canvas.width*xPositionInPercents) ){
            this.position.x = (canvas.width*xPositionInPercents)
            Game.platforms.forEach(platform =>{ 
                platform.position.x -= this.velocity.x
            })
            Game.decorations.forEach(decoration =>{
                decoration.position.x -= this.velocity.x
            })
        }  
    }
    updateState() {
        this.draw()
        this.offsetCamera(0.2)
        
        this.frameCounter+=1
        this.skipFrames(3)
        this.resetFrameCounter()

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.velocity.y += Game.gravity

        if(this.position.y > canvas.height){ // if falls in a water
            this.velocity.x = 0
            Game.over = true
            let spriteXPosition = canvas.width*0.5-gameOverSprite.width*0.5
            let spriteYPosition = canvas.height*0.5-gameOverSprite.height*0.5
            context.drawImage(gameOverSprite, spriteXPosition, spriteYPosition, 569, 333)
        }

    }
}
class Platform {
    constructor({image, x , y, scale = 1, width=250, height = 60}) {
        this.sprite = image
        this.width = width * scale
        this.height = height
        this.position = {x:x, y: canvas.height- this.height - y}
    }
    draw(){
        context.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height)
    }
    detectCollisions(character, horizontalOffset, verticalOffset){
        if ((character.position.y+verticalOffset)+character.height <= this.position.y &&        // if stands on the platform
        (character.position.y+verticalOffset)+character.height+character.velocity.y >= this.position.y && 
        (character.position.x+horizontalOffset)+character.width >= this.position.x &&                            // if further than left border
        (character.position.x+horizontalOffset) <= this.position.x+this.width)                                   // if closer than right border
        {
            character.velocity.y = 0                                                            // character does not fall
        }           
    }
}

class Decoration {
    constructor({image, x, y, width, height}){
        this.sprite = image
        this.position = {x:x, y:y}
        this.width = width
        this.height = height
    }
    draw(){
        context.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height)
    }
}
class Control {
    static startGame(){
        if(!Game.santa)
            Game.santa = new Player({sprite : santaSpriteArray})
        Game.platforms = []
        Game.decorations = [
            new Decoration({
                image: treeSprite,
                x: 340,
                y: canvas.height - 220,
                width: 180,
                height: 170} ),
            new Decoration({
                image: sleighSprite,
                x: 650,
                y: canvas.height - 180,
                width: 160,
                height: 140} ),
            new Decoration({image: snowmanSprite,
                x: 880,
                y: canvas.height - 190,
                width: 180,
                height: 150} ),
            new Decoration( {image: giftSprite,
                x: 500,
                y: canvas.height - 110,
                width: 60,
                height: 60} )]
        document.getElementById('score').innerHTML = 0
        Game.over = false
        Game.santa.position.x = -150
        Game.santa.position.y = canvas.height-200
        Game.santa.velocity.x = 5
        Game.createPlatforms(50)
    }
    static inputFlag = {
        up : {isActive : false}
    }
    static inputHandler(character){ //is called in animation loop, changes characters position each frame
        if(Control.inputFlag.up.isActive && Game.santa.velocity.y >=0){ // jump up
            character.position.y -= 13
        }
    }
    static jump(){
        Control.inputFlag.up.isActive = true
        setTimeout(() => { // hold control flag for 600ms
            Control.inputFlag.up.isActive = false
        }, "600")
    }

}
class Game {
    static over = true
    static santa = 0
    static decorations = []
    static platforms = []
    static gravity = 0.5
    
    static randFloat(min,max){
        return Math.random() * (max-min+1) + min
    }
    static randInt(min=150, max=300){
        let randomFloat = this.randFloat(min, max)
        let randomInt = Math.trunc(randomFloat)
        return randomInt
    }
    static createPlatforms(amount){
        let initialPlatform = new Platform(
            {image: platformSprite, x:-200, y:0, width:canvas.width+200} )
        Game.platforms.push(initialPlatform)
        for(let i=1; i<amount; i++){
            let prevPlaftorm = Game.platforms[i-1]
            let newPlaftorm = new Platform(
                {image: platformSprite, x:prevPlaftorm.position.x+prevPlaftorm.width + Game.randInt(), y:0, scale: this.randFloat(0.2,0.5)})
            Game.platforms.push(newPlaftorm)
        }   
    }
    static scoreCounter(){
        if(Game.santa.frameCounter % 7 == 0 && !Game.over){
            document.getElementById('score').innerHTML++
        }
    }

}


// recursive animation loop
function animate() {
    window.requestAnimationFrame(animate)
    context.clearRect(0,0,canvas.width, canvas.height) // clear previous frame
    context.drawImage(background, 0, 0, canvas.width, canvas.height)
    Game.decorations.forEach(decoration => {
        decoration.draw()
    })
    Game.platforms.forEach(platform =>{
        platform.draw()
        platform.detectCollisions(Game.santa, 30 , -30)
    })
    if(Game.santa){
        Game.santa.updateState()
        Control.inputHandler(Game.santa)
        Game.scoreCounter()
    }
}
animate()
 
