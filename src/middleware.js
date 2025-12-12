const middlewarePipeline = (req, res, handlers) => {
    const runNext = async (index = 0) => {
        if (res.writableEnded) return; // response already sent
        if (index >= handlers.length) return; // done

        const currentFn = handlers[index];

        try {
            if (currentFn.length === 2) {
                await currentFn(req, res);
                await runNext(index + 1);
            }
            else if (currentFn.length === 3) {
                await currentFn(req, res, () => runNext(index + 1));
            }
        } catch (error) {
            // Handle both sync and async errors
            if (!res.writableEnded) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error\n');
            }
            console.error('Handler error:', error);
        }
    };

    runNext();
}

export { middlewarePipeline };