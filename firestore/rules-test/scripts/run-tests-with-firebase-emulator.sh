    
#!/usr/bin/env bash
set +e # do not fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.." # parent dir of scripts dir
cd "${DIR}"

echo "Begin tests in ${DIR}"

    firebase emulators:start $EMULATOR_OPTS --only firestore & 
    FBPID=$! && 
    sleep 4 && npm run do_test ; TEST_EXIT_CODE=$? ; 
    echo "Killing firebase emulator server: $FBPID" && kill -STOP $FBPID 

echo "Tests done, exit with ${TEST_EXIT_CODE}"
exit $TEST_EXIT_CODE
