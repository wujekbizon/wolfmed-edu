export default function BottomResizableHandle() {
    return (
        <div className="relative flex items-center justify-center w-full h-2 bg-red-300/20 backdrop-blur-md border border-zinc-400/20 rounded-bl-md transition-colors rounded-br-md cursor-row-resize hover:bg-red-300/40">
            <div className="flex flex-row justify-center items-center w-full pointer-events-none">
                <span className="block w-1 h-1 bg-zinc-800/90 rounded-full mr-1"></span>
                <span className="block w-1 h-1 bg-zinc-800/80 rounded-full mr-1"></span>
                <span className="block w-1 h-1 bg-zinc-800/70 rounded-full"></span>
            </div>
        </div>
    );
}