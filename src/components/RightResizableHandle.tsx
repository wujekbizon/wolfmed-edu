export default function RightResizableHandle() {
    return (
        <div className="relative flex items-center justify-center h-full w-2 bg-zinc-800 backdrop-blur-md rounded-tr-md rounded-br-md border border-white/30 cursor-col-resize hover:bg-zinc-700">
            <div className="flex flex-col justify-center items-center h-full pointer-events-none">
                <span className="block w-1 h-1 bg-white/60 rounded-full mb-1"></span>
                <span className="block w-1 h-1 bg-white/60 rounded-full mb-1"></span>
                <span className="block w-1 h-1 bg-white/60 rounded-full"></span>
            </div>
        </div>
    )
}