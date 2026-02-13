import Stream from "stream";

// !!! THIS FILE IS FOR INFORMATIONAL PURPOSES ONLY 

// =============================== STDOUT ======================================

// stdout (standard output) is a fundamental output stream in computing systems.

// Here's a breakdown of what it is and how it works:


    // 1. Basic Definition:

        // stdout is the default output destination for a program

        // By default, it writes to the terminal/console window

        // It's one of three standard streams along with stdin (input) and stderr (error)




    // 2. In Node.js context:

        // These are equivalent ways to write to stdout
        console.log('Hello from console.log'); // Uses stdout internally
        process.stdout.write('Hello from process.stdout.write \n'); // Direct way

        // Example of a custom readable stream piping to stdout

        const readableStream = new Stream.Readable({
            read() {} // Implementing the _read method
        });

        // When creating a custom Readable stream, you need to implement the _read() method.
        // This is a required method that tells the stream how to fetch data.

        readableStream.push('ping 1 \n');
        readableStream.push('ping 2 \n');
        readableStream.push(null); // Signals the end of the stream

        // To see the output, pipe it to stdout
        readableStream.pipe(process.stdout);



    // 3. Key characteristics:

        // It's buffered by default (data may be collected before being written)

        // Can be redirected to other destinations like files or other programs

        // Is implemented as a writable stream in Node.js




    // 4. Common uses:

        // Writing directly to stdout
        process.stdout.write('Immediate output \n');

        // Progress indicators
        process.stdout.write('Loading... '); // \r returns to start of line
        process.stdout.write('\rStill loading... \n'); // writing this twice because since we used \r we are at begining of Loading... and will overwrite it with Still loading...


        process.stdout.write("A line that will be cleared...");
        // Clear line and write new content
        process.stdout.clearLine(0);  // Clear the current line
        process.stdout.cursorTo(0);   // Move cursor to beginning of line
        process.stdout.write('New content instead of \'A line that will be cleared...\' \n');


    // 5. Redirection examples (try in terminal):

        // # Redirect program output to a file
        // node program.js > output.txt

        // # Pipe output to another program
        // node program.js | grep "error"


// The stdout stream is a core concept in the Unix philosophy of having programs that do one thing well and can be combined through input/output streams to create more complex functionality.
