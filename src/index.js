import ReactDOM from 'react-dom';
import Timeline from './Timeline';

function App() {
    return (
        <>
            <h2><b>Airtable Timeline</b></h2>
            <pre>
                Some notes:
                <ul>
                    <li>Scroll the bordered container below horizontally to view the Timeline</li>
                    <li>Click on Item title to edit, hit enter or click away to save</li>
                    <li>Hover on title to view title in entirety (if truncated due to length)</li>
                    <li>Drag either side of an Item to resize and snap to new dates</li>
                    <li>Try to break something :)</li>
                </ul>
            </pre>
            <Timeline />
        </>
    );
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);