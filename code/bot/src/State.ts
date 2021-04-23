export default abstract class State {
    abstract next() : Promise<State>;
}