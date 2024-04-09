import {BrowserRouter as Switch, Route} from 'react-router-dom'
import Card from './CardPayment'


const App = () => {
    return(
        <Switch>
            <Route path = "/" exact>
                <Card/>
            </Route>
        </Switch>
    )
}

export default App;